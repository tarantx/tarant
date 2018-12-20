/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Message from './message'
import Partition from './partition'

export default interface ISubscriber<T> {
  partitions: Partition[]
  onReceiveMessage(message: Message<T>): Promise<boolean>
}
