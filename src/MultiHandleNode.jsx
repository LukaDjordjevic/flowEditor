import React, { memo } from 'react'

import { Handle } from 'react-flow-renderer'

export default memo(({ data, id }) => {
  const onHandleChange = (e) => data.onChangeTitleInput(e, id)
  let idCount = 0

  const handleSize = '0px'
  const topHandles = data.handles.top.map((isTargetHandle, i) => {
    idCount++
    return (
      <Handle
        id={`top_${i}`}
        key={`top_${i}`}
        type={isTargetHandle ? 'target' : 'source'}
        position="top"
        style={{
          background: '#555',
          left: `${(50 / data.handles.top.length) * (1 + 2 * i)}%`,
          top: '-5px',
          width: handleSize,
          height: handleSize,
        }}
        onConnect={(params) => console.log('handle onConnect', params)}
      />
    )
  })

  const bottomHandles = data.handles.bottom.map((isTargetHandle, i) => {
    idCount++
    return (
      <Handle
        id={`bottom_${i}`}
        key={`bottom_${i}`}
        type={isTargetHandle ? 'target' : 'source'}
        position="bottom"
        style={{
          background: '#555',
          left: `${(50 / data.handles.bottom.length) * (1 + 2 * i)}%`,
          bottom: '-5px',
          width: handleSize,
          height: handleSize,
        }}
        onConnect={(params) => console.log('handle onConnect', params)}
      />
    )
  })

  const nodeWidth = Math.max(
    data.handles.top.length * 40,
    data.handles.bottom.length * 40,
    100
  )

  console.log('nodeWidth', nodeWidth)

  // const nodeWidth = 50

  return (
    <div
      style={{
        width: `${nodeWidth}px`,
      }}
    >
      {topHandles}
      {bottomHandles}
      {/* <div>
        Fancy shmancy: <strong>{data.nodeTitle}</strong>
      </div> */}
      {/* <input
        className="nodrag"
        // type="text"
        onChange={onHandleChange}
        defaultValue={data.nodeTitle}
        style={{
          textAlign: 'center',
          outline: 'none',
          borderWidth: 0,
        }}
      /> */}
    </div>
  )
})
