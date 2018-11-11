export default async function sleep(ms: number): Promise<any> {
  return await new Promise(ok => {
    setTimeout(ok, ms)
  })
}
