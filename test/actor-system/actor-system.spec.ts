import Actor from '../../lib/actor-system/actor'
import IMaterializer from '../../lib/actor-system/materializer/materializer'
import ActorSystem from '../../lib/actor-system/actor-system'
import NamedActor from './fixtures/named-actor'
import SemaphoreActor from './fixtures/semaphore-actor'
import waitFor from './fixtures/wait-for'

describe('Actor System', () => {
  jest.useFakeTimers()

  let actorSystem: ActorSystem
  let materializer: IMaterializer

  beforeEach(() => {
    materializer = {
      onInitialize: jest.fn(),
      onBeforeMessage: jest.fn(),
      onAfterMessage: jest.fn(),
      onError: jest.fn()
    }
    
    actorSystem = ActorSystem.default(materializer)
  })

  afterEach(() => {
    actorSystem.free()
  })

  test('should build a new actor based on constructor parameters', async () => {
    const actor: NamedActor = actorSystem.new(NamedActor, ['myName'])
    const name = await waitFor(() => actor.sayHi())

    expect(name).toStrictEqual('myName')
  })

  test("should get an actor based on it's id", async () => {
    actorSystem.new(NamedActor, ['myName'])
    const foundActor: NamedActor = actorSystem.find('myName') as NamedActor

    const name = await waitFor(() => foundActor.sayHi())

    expect(name).toStrictEqual('myName')
  })

  test('should let actors process messages only once at a time', async () => {
    const cb = jest.fn()
    const actor: SemaphoreActor = actorSystem.new(SemaphoreActor, ['mySemaphore', cb])

    await waitFor(() => actor.runFor(5))
    await waitFor(() => actor.runFor(5))

    expect(cb).not.toHaveBeenCalledWith(2)
    expect(cb).toHaveBeenCalledTimes(2)
  })

  test('should call materializer when actor is built', async () => {
    const actor: SemaphoreActor = actorSystem.new(SemaphoreActor, ['mySemaphore', jest.fn()])
    expect(materializer.onInitialize).toHaveBeenCalled()
  })

  test('should call materializer before the message is processed', async () => {
    const actor: SemaphoreActor = actorSystem.new(SemaphoreActor, ['mySemaphore', jest.fn()])
    await waitFor(() => actor.runFor(5))

    expect(materializer.onBeforeMessage).toHaveBeenCalled()
  })
})
