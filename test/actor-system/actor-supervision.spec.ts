import ActorSystem from '../../lib/actor-system/actor-system'
import ActorSystemConfigurationBuilder from '../../lib/actor-system/configuration/actor-system-configuration-builder'
import IActorSupervisor from '../../lib/actor-system/supervision/actor-supervisor'
import FailingActor from './fixtures/failing-actor'
import waitFor from './fixtures/wait-for'

describe('Actor System Supervision', () => {
  jest.useFakeTimers()

  let actorSystem: ActorSystem
  let supervisor: IActorSupervisor

  beforeEach(() => {
    supervisor = { supervise: jest.fn() }

    actorSystem = ActorSystem.for(
      ActorSystemConfigurationBuilder.define()
        .withTopSupervisor(supervisor)
        .done(),
    )
  })

  afterEach(() => {
    actorSystem.free()
  })

  test('should call the top supervisor if the actor is a root actor', async () => {
    const thrownException = {}
    const actor: FailingActor = actorSystem.actorOf(FailingActor, [thrownException])
    
    try {
      await waitFor(() => actor.fails())
    } catch (ex) {
      expect(ex).toBe(thrownException)
    }

    expect(supervisor.supervise).toHaveBeenCalledWith(actor, thrownException)
  })
})
