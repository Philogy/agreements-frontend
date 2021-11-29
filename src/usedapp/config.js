import { ChainId } from '@usedapp/core'

const config = {
  readOnlyChainId: ChainId.xDai,
  readOnlyUrls: {
    [ChainId.xDai]: 'https://rpc.xdaichain.com'
  },
  supportedChains: [ChainId.xDai]
}

export default config
