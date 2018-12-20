/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ActorSystem from '../../lib/actor-system/actor-system'
import Topic from '../../lib/pubsub/topic'
import sleep from '../actor-system/fixtures/sleep'
import TopicSubscriberActor from '../actor-system/fixtures/topic-subscriber-actor'

describe('Topics', () => {
  jest.useRealTimers()
  let actorSystem: ActorSystem

  beforeEach(() => {
    actorSystem = ActorSystem.default()
  })

  afterEach(() => {
    actorSystem.free()
  })

  test('should send the message to a single subscriber', async () => {
    const callback = jest.fn()

    const topic = Topic.for(actorSystem, 'my-topic', TopicSubscriberActor)
    const receiver = actorSystem.actorOf(TopicSubscriberActor, [callback])

    topic.subscribe(receiver)
    await sleep(10)
    topic.doSomething('withMessage')
    await sleep(10)

    expect(callback).toHaveBeenCalledWith('withMessage')
  })

  test('should send the message to multiple subscribers', async () => {
    const callback = jest.fn()

    const topic = Topic.for(actorSystem, 'my-topic', TopicSubscriberActor)
    const receiver1 = actorSystem.actorOf(TopicSubscriberActor, [callback])
    const receiver2 = actorSystem.actorOf(TopicSubscriberActor, [callback])

    topic.subscribe(receiver1)
    topic.subscribe(receiver2)
    await sleep(10)
    topic.doSomething('withMessage')
    await sleep(10)

    expect(callback).toHaveBeenCalledTimes(2)
  })
})
