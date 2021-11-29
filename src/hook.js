import { useRef, useEffect } from 'react'

const useInterval = (callback, delay, directCall = true) => {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const tick = () => savedCallback.current()
    if (directCall) tick()
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay, directCall])
}

export { useInterval }
