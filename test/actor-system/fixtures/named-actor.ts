/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor from '../../../lib/actor-system/actor'

export default class NamedActor extends Actor {
  private readonly name: string

  public constructor(name: string) {
    super(name)

    this.name = name
  }

  public async sayHi(): Promise<string> {
    return this.name
  }
}
