/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Actor } from '../..'
import IActorSupervisor, { SupervisionStrategies } from './actor-supervisor'

export default class NoopActorSupervisor implements IActorSupervisor {
  public supervise(actor: Actor, exception: any, message: any): SupervisionStrategies {
    return 'drop-message'
  }
}
