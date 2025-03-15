function longfunc(runtime: number) : string {
  const startTime = performance.now()
  let n = 0
  while(performance.now() - startTime < runtime) {
    n++
  }
  return `Function ran for ${performance.now() - startTime} milliseconds, and looped ${n} times`
}

postMessage(longfunc(10000))
