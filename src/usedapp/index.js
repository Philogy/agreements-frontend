import React from 'react'
import { DAppProvider } from '@usedapp/core'
import config from './config'

function UseDAppProvider({ children }) {
  return <DAppProvider config={config}>{children}</DAppProvider>
}

export { UseDAppProvider }
