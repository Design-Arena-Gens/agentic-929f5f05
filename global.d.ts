declare global {
  function setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number
  function clearInterval(handle?: number): void
}

export {}
