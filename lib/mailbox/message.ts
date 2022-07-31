/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Partition from './partition'

export default class Message<T> {
  public static of<T>(partition: Partition, content: T): Message<T> {
    return new Message(partition, content)
  }

  public static ofJson(partition: Partition, content: object): Message<object> {
    return new Message(partition, content)
  }

  public readonly partition: Partition
  public readonly content: T

  private constructor(partition: Partition, content: T) {
    this.partition = partition
    this.content = content
  }
}
