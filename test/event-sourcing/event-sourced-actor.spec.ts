/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ActorSystem from '../../lib/actor-system/actor-system'
import sleep from '../fixtures/sleep'
import PublisherActor from './fixtures/publisher-actor'
import SubscriberActor from './fixtures/subscriber-actor'
import IMaterializer from '../../lib/materializer/materializer'
import { ActorSystemConfigurationBuilder } from '../../lib'

describe('Actor System Subscriptions', () => {
  let actorSystem: ActorSystem
  let firstMaterializer: IMaterializer

  beforeEach(() => {
    firstMaterializer = {
      onAfterMessage: jest.fn(),
      onAppliedEvent: jest.fn(),
      onBeforeMessage: jest.fn(),
      onError: jest.fn(),
      onInitialize: jest.fn(),
    }

    actorSystem = ActorSystem.for(
      ActorSystemConfigurationBuilder.define()
        .withMaterializers([firstMaterializer])
        .done(),
    )
  })

  afterEach(() => {
    actorSystem.free()
  })

  test('that applied messages are in the journal', async () => {
    const publisher = actorSystem.actorOf(PublisherActor, [])
    publisher.somethingHappens()

    await sleep(5)
    expect(publisher.ref.journal()).toEqual([
      {
        data: [],
        family: 'PublisherActor',
        name: 'somethingHappened',
        stream: publisher.ref.id,
        version: 1,
      },
    ])
  })

  test('that applied messages are notified to the materializer', async () => {
    const publisher = actorSystem.actorOf(PublisherActor, [])
    publisher.somethingHappens()

    await sleep(5)
    expect(firstMaterializer.onAppliedEvent).toHaveBeenCalledWith(publisher.ref, {
      family: 'PublisherActor',
      name: 'somethingHappened',
      stream: publisher.id,
      data: [],
      version: 1,
    })
  })

  test('that applied messages are in the journal of subscribers subscribing to the global journal', async () => {
    const publisher = actorSystem.actorOf(PublisherActor, [])
    const subscriber = actorSystem.actorOf(SubscriberActor, [
      (actor: SubscriberActor) => {
        actor.subscribeToJournal()
      },
    ])

    await sleep(1)
    publisher.somethingHappens()
    await sleep(1)

    expect(subscriber.ref.journal()).toEqual([
      {
        data: ['somethingHappened'],
        family: 'SubscriberActor',
        name: 'receivedMessage',
        stream: subscriber.ref.id,
        version: 1,
      },
    ])
  })

  test('that applied messages are in the journal of subscribers subscribing to the family journal', async () => {
    const publisher = actorSystem.actorOf(PublisherActor, [])
    const subscriber = actorSystem.actorOf(SubscriberActor, [
      (actor: SubscriberActor) => {
        actor.subscribeToFamily(PublisherActor)
      },
    ])

    await sleep(1)
    publisher.somethingHappens()
    await sleep(1)

    expect(subscriber.ref.journal()).toEqual([
      {
        data: ['somethingHappened'],
        family: 'SubscriberActor',
        name: 'receivedMessage',
        stream: subscriber.ref.id,
        version: 1,
      },
    ])
  })

  test('that applied messages are in the journal of subscribers subscribing to a single stream', async () => {
    const publisher = actorSystem.actorOf(PublisherActor, [])
    const subscriber = actorSystem.actorOf(SubscriberActor, [
      (actor: SubscriberActor) => {
        actor.subscribeToStream(publisher)
      },
    ])

    await sleep(1)
    publisher.somethingHappens()
    await sleep(1)

    expect(subscriber.ref.journal()).toEqual([
      {
        data: ['somethingHappened'],
        family: 'SubscriberActor',
        name: 'receivedMessage',
        stream: subscriber.ref.id,
        version: 1,
      },
    ])
  })

  test('that sourced messages are in the journal', async () => {
    const publisher = actorSystem.actorOf(PublisherActor, [])
    const events = [
      { name: 'somethingHappened', family: 'PublisherActor', stream: publisher.id, version: 1, data: [] },
      { name: 'somethingHappened', family: 'PublisherActor', stream: publisher.id, version: 2, data: [] },
      { name: 'somethingHappened', family: 'PublisherActor', stream: publisher.id, version: 3, data: [] },
    ]

    publisher.ref.source(events)
    expect(publisher.ref.journal()).toEqual(events)
  })

  test('that version should be the next event offset using index based on 1', async () => {
    const publisher = actorSystem.actorOf(PublisherActor, [])
    const events = [
      { name: 'somethingHappened', family: 'PublisherActor', stream: publisher.id, version: 1, data: [] },
      { name: 'somethingHappened', family: 'PublisherActor', stream: publisher.id, version: 2, data: [] },
      { name: 'somethingHappened', family: 'PublisherActor', stream: publisher.id, version: 3, data: [] },
    ]

    publisher.ref.source(events)
    expect(publisher.ref.version()).toEqual(4)
  })
})
