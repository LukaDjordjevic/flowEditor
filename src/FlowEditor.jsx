import React, { useState, useCallback, useEffect } from 'react'
import css from './flowEditor.css'

import ReactFlow, {
  removeElements,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useStoreState,
  useStoreActions,
  getConnectedEdges,
  useZoomPanHelper,
  isNode,
  isEdge,
} from 'react-flow-renderer'

import {
  getNextLevelOffsets,
  updateNextLevelNodesPositionOnAdd,
  getAllChildren,
  // getLeftOffsets,
  fixHorizontalPositions,
} from './util'

import {
  NODE_HORIZONTAL_SPACING_HALF,
  NODE_VERTICAL_SPACING,
  FLOW_STORAGE_KEY,
} from './constants'

import NodeProperties from './NodeProperties'
import EdgeProperties from './EdgeProperties'

import initialElements from './initial-elements'

import MultiHandleNode from './MultiHandleNode'
import StartingNode from './StartingNode'
import TerminalNode from './TerminalNode'

const nodeTypes = {
  multiHandle: MultiHandleNode,
  starting: StartingNode,
  terminal: TerminalNode,
}

const NodesDebugger = () => {
  // const nodes = useStoreState((state) => state.nodes)
  // const edges = useStoreState((state) => state.edges)

  // console.log('nodes', nodes)
  // console.log('edges', edges)
  // console.log('left offsets')
  // console.log(getLeftOffsets(nodes, 0))
  // console.log(getLeftOffsets(nodes, 1))
  // console.log(getLeftOffsets(nodes, 2))

  return null
}

const FlowEditor = () => {
  const [elements, setElements] = useState(initialElements)
  const [rfInstance, setRfInstance] = useState(null)
  const [selectedElements, setSelectedElements] = useState([])
  const [propertiesWindowType, setPropertiesWindowType] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectingNodeIds, setConnectingNodeIds] = useState([])
  const [lastNodeClicked, setLastNodeClicked] = useState(null)

  const updateNodeDimensions = useStoreActions(
    (actions) => actions.updateNodeDimensions
  )

  const onLoad = (reactFlowInstance) => {
    console.log('flow loaded:', reactFlowInstance)
    setRfInstance(reactFlowInstance)
    reactFlowInstance.fitView()
  }

  const onElementsRemove = (elementsToRemove) => {
    const removedEdges = elementsToRemove.filter(isEdge)
    const removedNode = elementsToRemove.find(isNode)
    const parentNode = removedEdges.find(
      (edge) => edge.target === removedNode.id
    ).source
    const outBoundEdges = removedEdges.filter(
      (edge) => edge.source === removedNode.id
    )
    const newElements = removeElements(elementsToRemove, elements)

    newElements.push(
      ...outBoundEdges.map((edge) => {
        return { ...edge, source: parentNode }
      })
    )
    const allChildren = getAllChildren(removedNode, elements)
    const allChildrenIds = allChildren.map((child) => child.id)
    newElements.forEach((elem) => {
      if (allChildrenIds.includes(elem.id)) {
        const newLevel = elem.data.treePosition.level - 1
        elem.data.treePosition.level = newLevel
        elem.position = {
          ...elem.position,
          // x: (elementLeftOffset - 1) * NODE_HORIZONTAL_SPACING_HALF,
          y: newLevel * NODE_VERTICAL_SPACING,
        }
      }
    })

    setElements(fixHorizontalPositions(newElements))
  }

  const onElementClick = (event, element) => {
    console.log('click', element)
    setLastNodeClicked(element)
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
          label: `Trans ${
            getConnectedEdges([sourceElement], allEdges).length + 1
          }`,
        },
      ])
      setIsConnecting(false)
      setConnectingNodeIds([])

      // Force rerender of connected nodes
      setTimeout(() => {
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
      }, 0)
    }
  }, [connectingNodeIds])

  const { transform } = useZoomPanHelper()

  const onNewMultiHandleNode = () => {
    const nextId = getNextElementId()
    const currentId = (parseInt(nextId) - 1).toString()
    const sourceElement = elements.find((elem) => {
      return elem.id === currentId
    })
    const allEdges = elements.filter(isEdge)

    const additionalElements = [
      {
        id: nextId,
        type: 'multiHandle',
        data: {
          handles: {
            top: sourceElement.type !== 'terminal' ? [1] : [],
            right: [],
            bottom: sourceElement.type !== 'terminal' ? [0] : [],
            left: [],
          },
          name: '',
        },
        style: {
          border: '1px solid #777',
          padding: 10,
          borderRadius: '7px',
          background: 'LemonChiffon',
          textAlign: 'center',
          fontSize: '12px',
        },
        position: { x: 0, y: getNewNodeY() + 90 },
      },
    ]

    if (sourceElement.type !== 'terminal') {
      additionalElements.push({
        id: Math.random().toString(),
        source: currentId,
        sourceHandle: 'bottom_0',
        target: nextId,
        targetHandle: 'top_0',
        arrowHeadType: 'arrowclosed',
        label: `Trans ${currentId}`,
      })
    }

    setElements([...elements, ...additionalElements])
  }

  // Fit view when elements change
  useEffect(() => {
    setTimeout(() => {
      if (rfInstance) rfInstance.fitView()
    }, 0)
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
      localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flow))
    }
  }, [rfInstance])

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(FLOW_STORAGE_KEY))
      if (flow) {
        const [x = 0, y = 0] = flow.position
        setElements(flow.elements || [])
        transform({ x, y, zoom: flow.zoom || 0 })
      }
    }
    restoreFlow()
  }, [setElements])

  const onNewTerminalNode = () => {
    const nextId = getNextElementId()
    const sourceId = (parseInt(nextId) - 1).toString()
    const sourceElement = elements.find((elem) => {
      return elem.id === sourceId
    })
    const allEdges = elements.filter(isEdge)
    const additionalElements = [
      {
        id: nextId,
        type: 'terminal',
        data: {
          handles: { top: [1], right: [], bottom: [], left: [] },
        },
        style: {
          border: '1px solid #777',
          padding: 10,
          borderRadius: '7px',
          background: 'lightcoral',
          width: '100px',
          textAlign: 'center',
          fontSize: '12px',
        },
        position: { x: 0, y: getNewNodeY() + 90 },
      },
    ]

    if (sourceElement.type !== 'terminal') {
      additionalElements.push({
        id: Math.random().toString(),
        source: sourceElement.id,
        sourceHandle: 'bottom_0',
        target: nextId,
        targetHandle: 'top_0',
        arrowHeadType: 'arrowclosed',
        label: `edge ${
          getConnectedEdges([sourceElement], allEdges).length + 1
        }`,
      })
    }
    setElements([...elements, ...additionalElements])
  }

  const onSelectionChange = (elems) => {
    setSelectedElements(elems)
    setPropertiesWindowType(null) // forces unmount of properties component
  }

  // Update properties window type based on selection
  useEffect(() => {
    if (selectedElements && selectedElements.length === 1) {
      if (isNode(selectedElements[0])) {
        setPropertiesWindowType('node')
      } else {
        setPropertiesWindowType('edge')
      }
    } else {
      setPropertiesWindowType(null)
    }
  }, [selectedElements])

  const onChangeElementTitle = (elem, name) => {
    let index = null
    const element = elements.find((item, i) => {
      index = i
      return item.id === elem.id
    })
    const updatedElement = isNode(element)
      ? { ...element, data: { ...elem.data, name } }
      : { ...element, label: name }

    const newElements = [...elements]
    newElements[index] = updatedElement
    setElements(newElements)
  }

  const onNodeDoubleClick = (e) => {
    const nextId = getNextElementId()
    const nextLevel = lastNodeClicked.data.treePosition.level + 1
    const sourceNodeLeftOffset = lastNodeClicked.data.treePosition.leftOffset
    const nextLevelOffsets = getNextLevelOffsets(elements, nextLevel)
    const isEvenNumberOfNextLevelNodes = nextLevelOffsets.length % 2 === 0
    const leftOffset = isEvenNumberOfNextLevelNodes
      ? sourceNodeLeftOffset
      : sourceNodeLeftOffset + 1

    // Update positions of nodes from next level
    const newElements = updateNextLevelNodesPositionOnAdd({
      elements,
      sourceNodeLeftOffset,
      nextLevel,
    })

    newElements.push(
      {
        id: nextId,
        type: 'multiHandle',
        data: {
          handles: {
            top: [1],
            right: [],
            bottom: [0],
            left: [],
          },
          name: '',
          treePosition: { level: nextLevel, leftOffset },
        },
        style: {
          border: '1px solid #777',
          padding: 10,
          borderRadius: '7px',
          background: 'LemonChiffon',
          textAlign: 'center',
          fontSize: '12px',
        },
        position: {
          x: leftOffset * NODE_HORIZONTAL_SPACING_HALF,
          y: nextLevel * NODE_VERTICAL_SPACING,
        },
      },
      {
        id: (parseInt(nextId) + 1).toString(),
        source: lastNodeClicked.id,
        sourceHandle: 'bottom_0',
        target: nextId,
        targetHandle: 'top_0',
        arrowHeadType: 'arrowclosed',
        label: `Trans ${(parseInt(nextId) + 1).toString()}`,
      }
    )
    setElements(newElements)
  }
  return (
    <div style={{ minWidth: '100%', display: 'flex', height: '100%' }}>
      {/** Toolbox window  */}
      <div className="flow-editor-toolbox">
        <div>
          {selectedElements && propertiesWindowType === 'node' && (
            <NodeProperties
              node={selectedElements[0]}
              onChangeTitle={onChangeElementTitle}
            />
          )}
          {selectedElements && propertiesWindowType === 'edge' && (
            <EdgeProperties
              edge={elements.find((el) => el.id === selectedElements[0].id)}
              onChangeTitle={onChangeElementTitle}
            />
          )}
        </div>
        <div className="flow-editor-buttons">
          <button className="flow-editor-button" onClick={onNewMultiHandleNode}>
            Add node
          </button>
          <button className="flow-editor-button" onClick={onNewTerminalNode}>
            Add terminal node
          </button>
          <button className="flow-editor-button" onClick={onConnectNodes}>
            Connect nodes
          </button>
          <div className="flow-editor-vertical-spacer"></div>
          <button className="flow-editor-button" onClick={onRestore}>
            Load
          </button>
          <button className="flow-editor-button" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
      <ReactFlow
        elements={elements}
        nodeTypes={nodeTypes}
        onElementsRemove={onElementsRemove}
        onSelectionChange={onSelectionChange}
        // onConnect={onConnect}
        onLoad={onLoad}
        onElementClick={onElementClick}
        snapToGrid={true}
        snapGrid={[10, 10]}
        onNodeDoubleClick={onNodeDoubleClick}
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
          style={{ top: '20px' }}
        />
        <Controls />
        <Background color="#aaa" gap={16} />
        <NodesDebugger />
      </ReactFlow>
    </div>
  )
}

export default FlowEditor
