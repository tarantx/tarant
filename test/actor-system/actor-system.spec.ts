import Actor from '../../lib/actor-system/actor'
import ActorSystem from '../../lib/actor-system/actor-system'
import ActorSystemConfigurationBuilder from '../../lib/actor-system/configuration/actor-system-configuration-builder'
import IMaterializer from '../../lib/actor-system/materializer/materializer'
import NoopResolver from '../../lib/actor-system/resolver/noop-resolver'
import NamedActor from './fixtures/named-actor'
import SemaphoreActor from './fixtures/semaphore-actor'
import waitFor from './fixtures/wait-for'

describe('Actor System', () => {
  jest.useFakeTimers()

  let actorSystem: ActorSystem
  let materializer: IMaterializer

  beforeEach(() => {
    materializer = {
      onAfterMessage: jest.fn(),
      onBeforeMessage: jest.fn(),
      onError: jest.fn(),
      onInitialize: jest.fn(),
    }

    actorSystem = ActorSystem.for(
      ActorSystemConfigurationBuilder.define()
        .withMaterializer(materializer)
        .done(),
    )
  })

  afterEach(() => {
    actorSystem.free()
  })

  test('should build a new actor based on constructor parameters', async () => {
    const actor: NamedActor = actorSystem.actorOf(NamedActor, ['myName'])
    const name = await waitFor(() => actor.sayHi())

    expect(name).toStrictEqual('myName')
  })

  test("should get an actor based on it's id", async () => {
    actorSystem.actorOf(NamedActor, ['myName'])
    const foundActor: NamedActor = (await actorSystem.actorFor('myName')) as NamedActor

    const name = await waitFor(() => foundActor.sayHi())

    expect(name).toStrictEqual('myName')
  })

  test('should let actors process messages only once at a time', async () => {
    const cb = jest.fn()
    const actor: SemaphoreActor = actorSystem.actorOf(SemaphoreActor, ['mySemaphore', cb])

    await waitFor(() => actor.runFor(5))
    await waitFor(() => actor.runFor(5))

    expect(cb).not.toHaveBeenCalledWith(2)
    expect(cb).toHaveBeenCalledTimes(2)
  })

  test('should call materializer when actor is built', async () => {
    const actor: SemaphoreActor = actorSystem.actorOf(SemaphoreActor, ['mySemaphore', jest.fn()])
    expect(materializer.onInitialize).toHaveBeenCalled()
  })

  test('should call materializer before the message is processed', async () => {
    const actor: SemaphoreActor = actorSystem.actorOf(SemaphoreActor, ['mySemaphore', jest.fn()])
    await waitFor(() => actor.runFor(5))

    expect(materializer.onBeforeMessage).toHaveBeenCalled()
  })

  test('should call materializer after the message is processed', async () => {
    const actor: SemaphoreActor = actorSystem.actorOf(SemaphoreActor, ['mySemaphore', jest.fn()])
    await waitFor(() => actor.runFor(5))

    expect(materializer.onAfterMessage).toHaveBeenCalled()
  })

  test('should call materializer when errored', async () => {
    const actor: SemaphoreActor = actorSystem.actorOf(SemaphoreActor, [
      'mySemaphore',
      () => {
        throw new Error('something')
      },
    ])

    try {
      await waitFor(() => actor.runFor(5))
    } catch (e) {
      // expected
    }

    expect(materializer.onError).toHaveBeenCalled()
  })
})
