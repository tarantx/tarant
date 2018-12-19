/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Actor } from '../..'

export type SupervisionResponse = 'drop-message' | 'retry-message' | 'kill-actor'

export default interface IActorSupervisor {
  supervise(actor: Actor, exception: any, message: any): SupervisionResponse
}
