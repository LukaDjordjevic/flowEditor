import React, { memo } from 'react'

import { Handle } from 'react-flow-renderer'

export default memo(({ data, id }) => {
  const handleSize = '0px'
  const topHandles = data.handles.top.map((isTargetHandle, i) => {
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

  return (
    <div
      style={{
        width: `${nodeWidth}px`,
      }}
    >
      {topHandles}
      {bottomHandles}
      <div>
        <strong>{data.name}</strong>
      </div>
    </div>
  )
})
