import React, { useState, useCallback, useEffect } from 'react'

import ReactFlow, {
  removeElements,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useStoreState,
  useStoreActions,
  getConnectedEdges,
  // useZoomPanHelper,
  isNode,
  isEdge,
} from 'react-flow-renderer'

import initialElements from './initial-elements'
import MultiHandleNode from './MultiHandleNode'
import StartingNode from './StartingNode'
import TerminalNode from './TerminalNode'

const flowKey = 'flowEditor'

const nodeTypes = {
  multiHandle: MultiHandleNode,
  starting: StartingNode,
  terminal: TerminalNode,
}

const NodesDebugger = () => {
  const nodes = useStoreState((state) => state.nodes)
  const edges = useStoreState((state) => state.edges)

  console.log('nodes', nodes)
  console.log('edges', edges)

  return null
}

const FlowEditor = () => {
  const [elements, setElements] = useState(initialElements)
  const [rfInstance, setRfInstance] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectingNodeIds, setConnectingNodeIds] = useState([])

  const updateNodeDimensions = useStoreActions(
    (actions) => actions.updateNodeDimensions
  )

  const onLoad = (reactFlowInstance) => {
    console.log('flow loaded:', reactFlowInstance)
    setRfInstance(reactFlowInstance)
    reactFlowInstance.fitView()
  }

  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els))

  // const onConnect = (params) => setElements((els) => addEdge(params, els))

  const onNodeDragStop = (event, node) => console.log('drag stop', node)
  const onElementClick = (event, element) => {
    console.log('click', element)
    if (isConnecting) {
      setConnectingNodeIds([...connectingNodeIds, element.id])
    }
  }

  // Add handles and connect nodes
  useEffect(() => {
    if (connectingNodeIds.length === 2) {
      // add handles
      const newElements = [...elements]
      let index = null
      const sourceElement = newElements.find((elem, i) => {
        index = i
        return elem.id === connectingNodeIds[0]
      })

      sourceElement.data = {
        ...sourceElement.data,
        handles: {
          ...sourceElement.data.handles,
          bottom: [...sourceElement.data.handles.bottom, 0],
        },
      }

      newElements[index] = sourceElement
      index = null

      const targetElement = newElements.find((elem, i) => {
        index = i
        return elem.id === connectingNodeIds[1]
      })

      newElements[index] = targetElement

      targetElement.data = {
        ...targetElement.data,
        handles: {
          ...targetElement.data.handles,
          top: [...targetElement.data.handles.top, 1],
        },
      }

      const allEdges = elements.filter(isEdge)
      const sourceConnectedOutputEdges = getConnectedEdges(
        [sourceElement],
        allEdges
      ).filter((edge) => edge.source === sourceElement.id)
      const targetConnectedInputEdges = getConnectedEdges(
        [targetElement],
        allEdges
      ).filter((edge) => edge.target === targetElement.id)

      // add connection and update nodes
      setElements([
        ...newElements,
        {
          id: Math.random().toString(),
          source: connectingNodeIds[0],
          sourceHandle: `bottom_${sourceConnectedOutputEdges.length}`,
          target: connectingNodeIds[1],
          targetHandle: `top_${targetConnectedInputEdges.length}`,
          arrowHeadType: 'arrowclosed',
          label: `edge ${
            getConnectedEdges([sourceElement], allEdges).length + 1
          }`,
        },
      ])
      setIsConnecting(false)
      setConnectingNodeIds([])

      // Force rerender of connected nodes
      setTimeout(() => {
        console.log('updating dimensions', sourceElement, targetElement)
        const sourceDomElement = document.querySelector(
          `.react-flow__node[data-id="${sourceElement.id}"]`
        )

        const targetDomElement = document.querySelector(
          `.react-flow__node[data-id="${targetElement.id}"]`
        )

        updateNodeDimensions([
          {
            id: sourceElement.id,
            nodeElement: sourceDomElement,
            forceUpdate: true,
          },
        ])

        updateNodeDimensions([
          {
            id: targetElement.id,
            nodeElement: targetDomElement,
            forceUpdate: true,
          },
        ])

        rfInstance.fitView()
      }, 0)
    }
  }, [connectingNodeIds])

  // const { transform } = useZoomPanHelper()

  const onNewMultiHandleNode = () => {
    const nextId = getNextElementId()
    console.log('ima elements', elements)
    const sourceElement = elements.find((elem) => {
      return elem.id === (parseInt(nextId) - 1).toString()
    })
    const allEdges = elements.filter(isEdge)
    console.log('-==========', elements, sourceElement, allEdges)
    setElements([
      ...elements,
      {
        id: nextId,
        type: 'multiHandle',
        data: {
          handles: { top: [1], right: [], bottom: [0], left: [] },
        },
        style: {
          border: '1px solid #777',
          padding: 10,
          borderRadius: '7px',
          background: '#fff',
        },
        position: { x: 0, y: getNewNodeY() + 70 },
      },
      {
        id: Math.random().toString(),
        source: (parseInt(nextId) - 1).toString(),
        sourceHandle: 'bottom_0',
        target: nextId,
        targetHandle: 'top_0',
        arrowHeadType: 'arrowclosed',
        label: `edge ${
          getConnectedEdges([sourceElement], allEdges).length + 1
        }`,
      },
    ])
    // setConnectingNodeIds([nextId - 1, nextId])
  }

  // Fit view when elements change
  useEffect(() => {
    if (rfInstance) rfInstance.fitView()
  }, [elements])

  // Connect nodes button click
  const onConnectNodes = () => {
    setIsConnecting(true)
    setConnectingNodeIds([])
  }

  const getNextElementId = () => {
    const nextId = (
      (Math.max(
        ...elements
          .filter(
            (element) =>
              typeof parseInt(element.id) === 'number' &&
              isFinite(parseInt(element.id))
          )
          .map((el) => parseInt(el.id))
      ) || 0) + 1
    ).toString()
    return isFinite(nextId) ? nextId : '1'
  }

  const getNewNodeY = () => {
    const maxY = Math.max(...elements.filter(isNode).map((el) => el.position.y))
    return isFinite(maxY) ? maxY : 0
  }

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject()
      localStorage.setItem(flowKey, JSON.stringify(flow))
    }
  }, [rfInstance])

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey))
      // flow.elements.forEach((elem) => {
      //   if (isNode(elem)) {
      //     elem.data.onChangeTitleInput = onChangeTitleInput
      //   }
      // })
      console.log('local storage', flow)
      if (flow) {
        const [x = 0, y = 0] = flow.position
        console.log('setting elements to', flow.elements || [])
        setElements(flow.elements || [])
        // transform({ x, y, zoom: flow.zoom || 0 })
      }
    }
    restoreFlow()
  }, [setElements])

  const sillyFn = () => {
    setElements([
      ...elements,
      {
        id: Math.random().toString(),
        source: '1',
        sourceHandle: 'bottom_0',
        target: '2',
        targetHandle: 'top_0',
        arrowHeadType: 'arrowclosed',
        label: 'edge with arrow head',
      },
    ])
  }

  return (
    <>
      <ReactFlow
        elements={elements}
        nodeTypes={nodeTypes}
        onElementsRemove={onElementsRemove}
        // onConnect={onConnect}
        onLoad={onLoad}
        onElementClick={onElementClick}
        onNodeDragStop={onNodeDragStop}
        snapToGrid={true}
        snapGrid={[10, 10]}
      >
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.style?.background) return n.style.background
            if (n.type === 'input') return '#0041d0'
            if (n.type === 'output') return '#ff0072'
            if (n.type === 'default') return '#1a192b'

            return '#eee'
          }}
          nodeColor={(n) => {
            if (n.style?.background) return n.style.background

            return '#fff'
          }}
          nodeBorderRadius={2}
        />
        <Controls />
        <Background color="#aaa" gap={16} />
        <NodesDebugger />
      </ReactFlow>
      <button onClick={onNewMultiHandleNode}>New node</button>
      <button onClick={onConnectNodes}>Connect nodes</button>
      <button onClick={onRestore}>Load</button>
      <button onClick={onSave}>Save</button>
      <button onClick={sillyFn}>Silly</button>
    </>
  )
}

export default FlowEditor
