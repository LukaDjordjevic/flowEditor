import React from 'react'

const EdgeProperties = ({ edge, onChangeTitle }) => {
  const onChange = (e) => {
    onChangeTitle(edge, e.target.value)
  }
  return (
    <div className="flow-editor-properties">
      <div className="flow-editor-properties-title">Transition properties</div>
      <label className="flow-editor-properties-label">Name</label>
      <input
        className="flow-editor-properties-input"
        defaultValue={edge && edge.label}
        onChange={onChange}
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
