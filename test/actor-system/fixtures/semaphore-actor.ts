import Actor from '../../../lib/actor-system/actor'
import sleep from './sleep'

export default class SemaphoreActor extends Actor {
  private current: number
  private readonly callback: (n: number) => void

  public constructor(id: string, callback: (n: number) => void) {
    super(id)

    this.current = 0
    this.callback = callback
  }

  public async runFor(ms: number): Promise<any> {
    this.current++
    this.callback(this.current)
    await sleep(ms)
    this.current--

  }
}
