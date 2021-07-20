import React, { memo } from 'react'

import { Handle } from 'react-flow-renderer'

export default memo(({ data, id }) => {
  let idCount = 0

  const handleSize = '0px'

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

  return (
    <div
      style={{
        borderRadius: '20px',
        width: '100px',
        background: 'green',
      }}
    >
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
