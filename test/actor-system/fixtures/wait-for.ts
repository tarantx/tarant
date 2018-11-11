export default async function waitFor<T>(fn: () => Promise<T>): Promise<T> {
  const r = fn()
  jest.advanceTimersByTime(10)
  return await r
}
