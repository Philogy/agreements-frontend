import React, { useState, useEffect } from 'react'
import { Button, notification, InputNumber } from 'antd'
import { useEthers, shortenIfAddress, useEtherBalance, useBlockNumber } from '@usedapp/core'
import { utils } from 'ethers'
import { useInterval } from '../hook.js'
import { nftAuction } from '../usedapp/contracts.js'
import { displayTimeDelta, round, s } from '../misc.js'

function AuctionFooter() {
  return (
    <div className="absolute w-screen bottom-0 left-0 flex justify-center items-center bg-gray-200 h-24">
      <div className="flex justify-around w-1/3">
        <a href="https://www.blockscout.com/xdai/mainnet/address/0x45373E3173c17bEB3cD86D35092D0C4c7385ea23/read-contract">
          blockscout
        </a>
        <a href="https://github.com/Philogy/web3-agreements/blob/main/contracts/NFTSale.sol">
          github
        </a>
        <span>Message Philogy#8073 on Discord about any questions</span>
      </div>
    </div>
  )
}

const formatBN = (bn) => (bn === null ? '???' : utils.formatUnits(bn))
const bnToFloat = (bn) => bn && parseFloat(utils.formatUnits(bn))

function NFTAuction() {
  const { activateBrowserWallet, account } = useEthers()
  const blockNumber = useBlockNumber()
  const [connectAccountLoading, setLoading] = useState(false)
  const [timeRemaining, setRemaining] = useState(10_000)
  const auctionDeadline = nftAuction.useDeadline()
  const topBid = nftAuction.useTopBid()
  const topBidder = nftAuction.useTopBidder()
  const minimumBid = bnToFloat(nftAuction.useMinimumBid())
  const allBids = nftAuction.useBidEvents().map(({ args, blockNumber: eventBlockNumber }) => ({
    bidder: args.bidder,
    bid: round(bnToFloat(args.newBid), 3),
    blocksPassed: blockNumber - eventBlockNumber
  }))
  const pastBids = allBids.slice(0, -1)

  const pendingRefund = nftAuction.usePendingRefund(account)
  const { send: sendWithdrawPayments } = nftAuction.useMethodCall('withdrawPayments')
  const [refundLoading, setRefundLoading] = useState(false)
  const triggerRefund = async () => {
    setRefundLoading(true)
    try {
      await sendWithdrawPayments(account)
    } finally {
      setRefundLoading(false)
    }
  }

  const { send: sendBid } = nftAuction.useMethodCall('bid')
  const accountBalance = bnToFloat(useEtherBalance(account))
  const [bidAmount, setBidAmount] = useState(0)
  const [bidLoading, setBidLoading] = useState(false)
  useEffect(() => {
    setBidAmount(Math.max(bidAmount, minimumBid))
  }, [minimumBid])
  const triggerBid = async () => {
    setBidLoading(true)
    try {
      await sendBid({ value: utils.parseUnits(bidAmount.toString()) })
    } finally {
      setBidLoading(false)
    }
  }

  useInterval(() => {
    setRemaining(auctionDeadline - Math.floor(Date.now() / 1000))
  }, 1000)

  async function connectWallet() {
    setLoading(true)
    try {
      await new Promise((resolve, reject) => activateBrowserWallet(reject).then(resolve))
      notification.info({
        message: 'Connected Wallet'
      })
    } catch (err) {
      switch (err.name) {
      case 'UnsupportedChainIdError':
        notification.error({
          message: 'Unsupported Network',
          description: 'Please switch to the xDai network'
        })
        break
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col justify-center p-12 w-full h-full">
      <div className="absolute left-0 top-0 flex justify-between items-center align-center w-full bg-gray-200 h-24 p-8">
        <div className="flex flex-col">
          <span className="text-3xl font-bold">
            Auctioning off farming deposits worth around $2,600
          </span>
          <span>1,674 xCOMB-xDAI LP tokens + 300 xCOMB tokens</span>
        </div>
        <div>
          {account ? (
            <span>
              <span className="font-bold">Account</span>: {account}
            </span>
          ) : (
            <Button onClick={connectWallet} loading={connectAccountLoading} shape="round">
              Connect Metamask
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-3xl">
          Top bid: <span className="font-bold">{formatBN(topBid)} xDAI</span>
        </h2>
        <p>
          (from:{' '}
          {topBidder === account ? (
            <span className="font-bold">you</span>
          ) : (
            shortenIfAddress(topBidder)
          )}
          )
        </p>
        <h1 className="text-2xl">Auction ends in {displayTimeDelta(timeRemaining)}</h1>
        <div className="mt-8 flex justify-around w-1/3">
          <div className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded-xl shadow-inner">
            <p className="text-lg font-bold">Pending refund</p>
            {pendingRefund && pendingRefund.gt(0) ? (
              <>
                <p>{formatBN(pendingRefund)} xDAI</p>
                <Button
                  type="primary"
                  shape="round"
                  loading={refundLoading}
                  onClick={triggerRefund}
                >
                  Claim Refund
                </Button>
              </>
            ) : (
              <p>No pending refund</p>
            )}
          </div>
          <div className="flex flex-col items-center bg-gray-100 p-4 rounded-xl shadow-inner">
            <div className="flex flex-col items-center mb-4">
              <span className="text-lg font-bold">Bid on Auction</span>
              <span className="text-xs">Must bid at least 5% above the top bid</span>
            </div>

            <div className="flex space-x-2">
              <InputNumber
                shape="round"
                placeholder="bid amount"
                type="number"
                min={minimumBid}
                max={accountBalance}
                style={{ width: 120 }}
                value={bidAmount}
                onChange={setBidAmount}
              />
              <Button
                type="primary"
                shape="round"
                onClick={triggerBid}
                loading={bidLoading}
                disabled={bidAmount > accountBalance || minimumBid > bidAmount}
              >
                Bid
              </Button>
            </div>
            {minimumBid > accountBalance && (
              <p className="text-red-400 text-xs mt-1">Balance is below minimum bid</p>
            )}
          </div>
        </div>
        <div className="flex flex-col mt-8 w-2/3 overflow-x-auto px-8 pb-4">
          <h2 className="text-lg font-bold">Past bids</h2>
          <div className="flex space-x-4">
            {pastBids.reverse().map(({ bidder, bid, blocksPassed }, i) => (
              <div
                className="bg-gray-100 p-2 shadow-md rounded flex flex-col items-center justify-center w-48 h-24"
                key={i}
              >
                <span>{bid} xDAI</span>
                <span>
                  from{' '}
                  <a href={`https://blockscout.com/address/${bidder}`}>
                    {shortenIfAddress(bidder)}
                  </a>
                </span>
                <span>
                  {blocksPassed} block{s(blocksPassed)} ago
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AuctionFooter />
    </div>
  )
}

export default NFTAuction
