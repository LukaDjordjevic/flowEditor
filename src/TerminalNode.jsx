import React, { memo } from 'react'

import { Handle } from 'react-flow-renderer'

export default memo(({ data, id }) => {
  let idCount = 0

  const handleSize = '0px'

  return (
    <div>
      <Handle
        id={`top`}
        key={`top`}
        type={'target'}
        position="top"
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
