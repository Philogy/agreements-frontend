import { useEffect, useState } from 'react'
import { Contract, utils } from 'ethers'
import { useContractCall, useContractFunction, useBlockNumber, useEthers } from '@usedapp/core'

const createContractCallEncoder = (abi, address) => {
  const interfaceAbi = new utils.Interface(abi)
  return (method, ...args) => ({
    abi: interfaceAbi,
    address,
    method,
    args
  })
}

const useSimpleCall = (callEncoder, method, ...args) => {
  const rawValue = useContractCall(callEncoder(method, ...args))
  if (rawValue) return rawValue[0]
  return null
}

const contractFromEncoder = (callEncoder, provider) => {
  const { address, abi } = callEncoder(null)
  return new Contract(address, abi, provider)
}

const useMethodCall = (callEncoder, method) =>
  useContractFunction(contractFromEncoder(callEncoder), method)

const useEvents = (callEncoder, eventConfig, ...args) => {
  const [events, setEvents] = useState([])
  const { library } = useEthers()
  const blockNumber = useBlockNumber()
  useEffect(async () => {
    if (!library) return
    const contract = contractFromEncoder(callEncoder, library)
    const eventFilter =
      typeof eventConfig === 'string' ? contract.filters[eventConfig]() : eventConfig
    setEvents(await contract.queryFilter(eventFilter, ...args))
  }, [blockNumber, library])

  return events
}

export { createContractCallEncoder, useSimpleCall, useMethodCall, contractFromEncoder, useEvents }
