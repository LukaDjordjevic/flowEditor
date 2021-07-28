import React, { useEffect, useRef } from 'react'

const NodeProperties = ({ node, onChangeTitle, onFocus }) => {
  const onChange = (e) => {
    onChangeTitle(node, e.target.value)
  }

  const nameInput = useRef(null)

  // useEffect(() => {
  //   nameInput.current.focus()
  // }, [])

  return (
    <div className="flow-editor-properties">
      <div className="flow-editor-properties-title">State properties</div>
      <label className="flow-editor-properties-label">Name</label>
      <input
        ref={nameInput}
        className="flow-editor-properties-input"
        defaultValue={node.data && node.data.name}
        onChange={onChange}
        onFocus={onFocus}
      />
    </div>
  )
}

export default NodeProperties
