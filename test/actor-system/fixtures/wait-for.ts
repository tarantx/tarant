export default async function waitFor<T>(fn: () => Promise<T>): Promise<T> {
  const r = fn()
  jest.advanceTimersByTime(100)
  return await r
}
