import logo from './logo.svg'
import './App.css'
import FlowEditor from './FlowEditor'
import { ReactFlowProvider } from 'react-flow-renderer'

function App() {
  return (
    <div className="App">
      <div
        id="canvas"
        style={{
          width: '100%',
          height: '900px',
        }}
      >
        <ReactFlowProvider>
          <FlowEditor  />
        </ReactFlowProvider>
      </div>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
