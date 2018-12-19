/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Actor } from '../..'
import IActorSupervisor from './actor-supervisor'
import { SupervisionResponse } from './actor-supervisor'

export default class NoopActorSupervisor implements IActorSupervisor {
  public supervise(actor: Actor, exception: any, message: any): SupervisionResponse {
    return 'drop-message'
  }
}
