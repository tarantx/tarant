/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor from '../../../lib/actor-system/actor'
import Topic from '../../../lib/pubsub/topic'

export default class TopicSubscriberFromConstructorActor extends Actor {
  private readonly callback: any

  public constructor(callback: any, topic: Topic<TopicSubscriberFromConstructorActor>) {
    super()

    this.callback = callback
    this.subscribeToTopic(topic)
  }

  public triggerUnsubscriptionOf(topic: Topic<TopicSubscriberFromConstructorActor>): void {
    this.unsubscribeFromTopic(topic)
  }

  public doSomething(withString: string): void {
    this.callback(withString)
  }
}
