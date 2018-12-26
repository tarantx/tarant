/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor from '../../actor-system/actor'
import IResolver from './resolver'

export default class NoopResolver implements IResolver {
  public async resolveActorById(id: string): Promise<Actor | undefined> {
    return Promise.resolve(undefined)
  }
}
