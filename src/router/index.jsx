import React from 'react'
import { Routes, Route } from 'react-router-dom'
import routes from './routes.js'

function Router() {
  return (
    <Routes>
      {routes.map(({ route, component }, i) => (
        <Route path={route} element={component()} key={i} />
      ))}
    </Routes>
  )
}

export default Router
