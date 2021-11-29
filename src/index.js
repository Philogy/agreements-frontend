import './index.css'
import 'antd/dist/antd.css'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { UseDAppProvider } from './usedapp'

ReactDOM.render(
  <React.StrictMode>
    <UseDAppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UseDAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
