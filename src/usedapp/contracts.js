import NFTSale from './artifacts/NFTSale.json'
import { useContractCall } from '@usedapp/core'
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

export { nftAuction }
