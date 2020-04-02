/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ActorMessage from '../../lib/actor-system/actor-message'
import ActorSystem from '../../lib/actor-system/actor-system'
import ActorSystemConfigurationBuilder from '../../lib/actor-system/configuration/actor-system-configuration-builder'
import IActorSupervisor from '../../lib/actor-system/supervision/actor-supervisor'
import FailingActor from './fixtures/failing-actor'
import ParentOfFailingActorActor from './fixtures/parent-of-failing-actor'
import waitFor from './fixtures/wait-for'

describe('Actor System Supervision', () => {
  jest.useFakeTimers()

  let actorSystem: ActorSystem
  let supervisor: IActorSupervisor

  beforeEach(() => {
    supervisor = { supervise: jest.fn() }

    actorSystem = ActorSystem.for(ActorSystemConfigurationBuilder.define().withTopSupervisor(supervisor).done())
  })

  const messagesForActor = (actor: any): ActorMessage[] => {
    const unsafeSystem = actorSystem as any
    const subscription = unsafeSystem.subscriptions.get(actor.ref.id) as string
    const partitions = unsafeSystem.mailbox.subscribedPartitions[subscription] as [string]

    return partitions.reduce((prev: ActorMessage[], cur: string): ActorMessage[] => {
      return unsafeSystem.mailbox.subscriptions[cur]
        .filter((managedSub: any) => managedSub.id === subscription)
        .map((managedSub: any): ActorMessage[] => managedSub.messages)
        .concat(prev)
    }, [])
  }

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

    expect(supervisor.supervise).toHaveBeenCalled()
  })

  test('should call parent actor for supervision on supervision', async () => {
    const thrownException = {}
    const currentSupervisor = { supervise: jest.fn() }

    const parent: ParentOfFailingActorActor = actorSystem.actorOf(ParentOfFailingActorActor, [currentSupervisor])
    const actor: FailingActor = await waitFor(() => parent.newFailingActor(thrownException))

    try {
      await waitFor(() => actor.fails())
    } catch (ex) {
      expect(ex).toBe(thrownException)
    }

    expect(currentSupervisor.supervise).toHaveBeenCalled()
  })

  test('should not drop the message when the supervision is retry', async () => {
    const thrownException = {}
    supervisor.supervise = () => 'retry-message'
    const actor: FailingActor = actorSystem.actorOf(FailingActor, [thrownException])

    try {
      waitFor(() => actor.fails())
    } catch (ex) {
      expect(ex).toBe(thrownException)
    }

    expect(messagesForActor(actor).length).toEqual(1)
  })
})
