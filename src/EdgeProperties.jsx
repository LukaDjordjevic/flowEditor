import React, { useRef, useEffect } from 'react'

const EdgeProperties = ({ edge, onChangeTitle, onFocus }) => {
  const onChange = (e) => {
    onChangeTitle(edge, e.target.value)
  }

  const nameInput = useRef(null)

  // useEffect(() => {
  //   nameInput.current.focus()
  // }, [])

  return (
    <div className="flow-editor-properties">
      <div className="flow-editor-properties-title">Transition properties</div>
      <label className="flow-editor-properties-label">Name</label>
      <input
        ref={nameInput}
        className="flow-editor-properties-input"
        defaultValue={edge && edge.label}
        onChange={onChange}
        onFocus={onFocus}
      />
      <div className="flow-editor-vertical-spacer" />
      <label className="flow-editor-properties-label">Action 1</label>
      <input className="flow-editor-properties-input" />
      <label className="flow-editor-properties-label">Action 2</label>
      <input className="flow-editor-properties-input" />
      <label className="flow-editor-properties-label">Action 3</label>
      <input className="flow-editor-properties-input" />
      <label className="flow-editor-properties-label">Action 4</label>
      <input className="flow-editor-properties-input" />
    </div>
  )
}

export default EdgeProperties
