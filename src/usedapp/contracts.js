import NFTSale from './artifacts/NFTSale.json'
import UniswapV2PoolAbi from './artifacts/UniswapV2PoolAbi.json'
import pools from './artifacts/pools.json'
import { constants } from 'ethers'
import HoneyFarm from './artifacts/HoneyFarm.json'
import { useContractCall, useContractCalls } from '@usedapp/core'
import { createContractCallEncoder, useSimpleCall, useMethodCall, useEvents } from './utils.js'

const nftAuctionCall = createContractCallEncoder(NFTSale.abi, NFTSale.address)
const useAuctionDeadline = () => {
  const rawAuctionDeadline = useContractCall(nftAuctionCall('auctionDeadline'))
  if (rawAuctionDeadline) return rawAuctionDeadline[0].toNumber()
  return null
}
const nftAuction = {
  encodeCall: nftAuctionCall,
  useMethodCall: (method) => useMethodCall(nftAuctionCall, method),
  useDeadline: useAuctionDeadline,
  useTopBid: () => useSimpleCall(nftAuctionCall, 'topBid'),
  useTopBidder: () => useSimpleCall(nftAuctionCall, 'topBidder'),
  useMinimumBid: () => useSimpleCall(nftAuctionCall, 'minimumBid'),
  usePendingRefund: (account) => useSimpleCall(nftAuctionCall, 'payments', account),
  useBidEvents: () => useEvents(nftAuctionCall, 'NewTopBid')
}

const farmCall = createContractCallEncoder(HoneyFarm.abi, HoneyFarm.address)
const useTotalPendingComb = () => {
  const pendingXComb = useContractCalls(
    [8505, 9528, 9527, 8744, 9927].map((depositId) => farmCall('pendingHsf', depositId))
  )
  if (pendingXComb && pendingXComb.every((a) => a)) {
    return pendingXComb.reduce((total, [pending]) => total.add(pending), constants.Zero)
  }
  return constants.Zero
}

const xCombPoolCall = createContractCallEncoder(UniswapV2PoolAbi, pools['xCOMB-xDAI'])
const useXCombPoolPrice = () => {
  const rawReturn = useContractCall(xCombPoolCall('getReserves'))
  const rawTotalLPSupply = useContractCall(xCombPoolCall('totalSupply'))
  if (!rawReturn || !rawTotalLPSupply) return null
  const { _reserve0: xCombReserves, _reserve1: xDaiReserves } = rawReturn
  const [totalLPSupply] = rawTotalLPSupply
  const xCombPrice = xDaiReserves.mul(constants.WeiPerEther).div(xCombReserves)
  const lpPrice = xDaiReserves.mul(2).mul(constants.WeiPerEther).div(totalLPSupply)
  return { xCombPrice, lpPrice }
}

export { nftAuction, useTotalPendingComb, useXCombPoolPrice }
