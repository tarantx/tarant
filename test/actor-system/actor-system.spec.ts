import Actor from '../../lib/actor-system/actor'
import ActorSystem from '../../lib/actor-system/actor-system'

describe('Actor System', () => {
  jest.useFakeTimers()

  let actorSystem: ActorSystem

  beforeEach(() => {
    actorSystem = ActorSystem.default()
  })

  afterEach(() => {
    actorSystem.free()
  })

  test('should build a new actor based on constructor parameters', async () => {
    const actor: PingActor = actorSystem.new(PingActor, ['myName'])
    const name = await waitFor(() => {
      return actor.sayHi()
    })

    expect(name).toStrictEqual('myName')
  })
})

async function waitFor<T>(fn: () => Promise<T>): Promise<T> {
  const r = fn()
  jest.advanceTimersByTime(10)
  return await r
}

class PingActor extends Actor {
  private readonly name: string

  public constructor(name: string) {
    super(name)

    this.name = name
  }

  public async sayHi(): Promise<string> {
    return this.name
  }
}
