/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Actor } from '../..'

export type SupervisionStrategies = 'drop-message' | 'retry-message' | 'kill-actor'

export default interface IActorSupervisor {
  /**
   * @param actor Actor that failed processing the message
   * @param exception Exception that has been raised
   * @param message Message that failed
   */
  supervise(actor: Actor, exception: any, message: any): SupervisionStrategies
}
