const s = (value) => (value === 1 ? '' : 's')
const divmod = (dividend, divisor) => [Math.floor(dividend / divisor), dividend % divisor]
const displaySValue = (value, type) => `${value} ${type}${s(value)}`
const min = (values) => values.reduce((a, b) => Math.min(a, b))
const longestSeq = (values) => {
  let longestSeq = 0
  for (const value of values) {
    if (!value) return longestSeq
    longestSeq++
  }
  return longestSeq
}

const displayTimeDelta = (timeDelta) => {
  const [totalMinutes, secondsLeft] = divmod(timeDelta, 60)
  const [totalHours, minutesLeft] = divmod(totalMinutes, 60)
  const [daysLeft, hoursLeft] = divmod(totalHours, 24)

  const deltaStringComponents = [
    displaySValue(daysLeft, 'day'),
    displaySValue(hoursLeft, 'hour'),
    displaySValue(minutesLeft, 'minute'),
    displaySValue(secondsLeft, 'second')
  ]
  const isEmpty = [daysLeft, hoursLeft, minutesLeft, secondsLeft].map((x) => x === 0)
  return deltaStringComponents.slice(longestSeq(isEmpty)).join(' ')
}

const round = (num, places = 2) => {
  const shifted = `${num}e+${places}`
  const roundedPreShift = Math.round(shifted)
  return +`${roundedPreShift}e-${places}`
}

const format = (num, maxFracDigits = 3, minFracDigits = null) => {
  minFracDigits = minFracDigits ?? maxFracDigits
  return Intl.NumberFormat('en-us', {
    maximumFractionDigits: maxFracDigits,
    minimumFractionDigits: minFracDigits
  }).format(num)
}

export { s, divmod, min, displaySValue, longestSeq, displayTimeDelta, round, format }
