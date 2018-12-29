/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { IActor } from '../../actor-system/actor'

export default interface IResolver {
  resolveActorById(id: string): Promise<IActor>
}
