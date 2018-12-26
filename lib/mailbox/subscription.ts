/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Message from './message'
import ISubscriber from './subscriber'

export default class Subscription<T> {
  public readonly messages: Array<Message<T>> = []
  public readonly id: string
  public readonly subscriber: ISubscriber<T>

  public constructor(id: string, subscriber: ISubscriber<T>) {
    this.id = id
    this.subscriber = subscriber
  }

  public async process(): Promise<void> {
    const message = this.messages[0]
    if (message) {
      if (await this.subscriber.onReceiveMessage(message)) {
        this.messages.splice(0, 1)
      }
    }
  }
}
