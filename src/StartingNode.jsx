import React, { memo } from 'react'

import { Handle } from 'react-flow-renderer'

export default memo(({ data }) => {
  const handleSize = '0px'

  return (
    <div>
      <Handle
        id={`bottom_0`}
        key={`bottom_0`}
        type={'source'}
        position="bottom"
        style={{
          background: '#555',
          left: `50%`,
          bottom: '-5px',
          width: handleSize,
          height: handleSize,
        }}
        onConnect={(params) => console.log('handle onConnect', params)}
      />
      <div>
        <strong>{data.name}</strong>
      </div>
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
