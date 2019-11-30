/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ActorSystem from '../../lib/actor-system/actor-system'
import Topic from '../../lib/pubsub/topic'
import sleep from './fixtures/sleep'
import TopicSubscriberFromConstructorActor from './fixtures/topic-subscriber-from-constructor-actor'

describe('Actor System Subscriptions', () => {
  jest.useRealTimers()
  let actorSystem: ActorSystem

  beforeEach(() => {
    actorSystem = ActorSystem.default()
  })

  afterEach(() => {
    actorSystem.free()
  })

  test('call methods in a subscriptor', async () => {
    const cb = jest.fn()
    const topic = Topic.for(actorSystem, 'topic-name', TopicSubscriberFromConstructorActor)
    const actor = actorSystem.actorOf(TopicSubscriberFromConstructorActor, [cb, topic])
    await sleep(10)
    topic.doSomething('xxx')
    await sleep(10)

    expect(cb).toHaveBeenCalledWith('xxx')
  })

  test('not call methods when unsubscribed', async () => {
    const cb = jest.fn()
    const topic = Topic.for(actorSystem, 'topic-name', TopicSubscriberFromConstructorActor)
    const actor = actorSystem.actorOf(TopicSubscriberFromConstructorActor, [cb, topic])
    await sleep(100)
    actor.triggerUnsubscriptionOf(topic)
    await sleep(100)
    topic.doSomething('xxx')
    await sleep(100)

    expect(cb).not.toHaveBeenCalledWith('xxx')
  })
})
