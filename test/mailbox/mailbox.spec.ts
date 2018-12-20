/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Mailbox from '../../lib/mailbox/mailbox'
import Message from '../../lib/mailbox/message'
import Partition from '../../lib/mailbox/partition'
import ISubscriber from '../../lib/mailbox/subscriber'

interface IMessageHolder {
  messages: [object]
}

describe('Mailbox', () => {
  const partition = '1'

  test('should poll messages from producers and offer them to subscribers', () => {
    const message = Message.ofJson(partition, { test: true })
    const mailbox = Mailbox.empty()
    const subscriber = dummySubscriber(partition)

    const subscription = mailbox.addSubscriber(subscriber)
    mailbox.push(message)
    mailbox.poll(subscription)

    const [outcome] = subscriber.messages
    expect(outcome).toStrictEqual(message)
  })

  test('should not poll messages after an unsubscription', () => {
    const message = Message.ofJson(partition, { test: true })
    const mailbox = Mailbox.empty()
    const subscriber = dummySubscriber(partition)

    const subscription = mailbox.addSubscriber(subscriber)
    mailbox.push(message)
    mailbox.removeSubscription(subscription)
    mailbox.poll(subscription)

    expect(subscriber.messages).toStrictEqual([])
  })
})

function dummySubscriber(partition: Partition): ISubscriber<object> & IMessageHolder {
  const messages: [object] = ([] as unknown) as [object]

  return {
    messages,
    onReceiveMessage: message => {
      messages.push(message)
      return Promise.resolve(true)
    },
    partitions: [partition],
  }
}
