/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { v4 as uuid } from 'uuid'
import Actor from '../../../lib/actor-system/actor'

export default class FailingActor extends Actor {
  private readonly exceptionToThrow: any

  public constructor(exceptionToThrow: any) {
    super(uuid())

    this.exceptionToThrow = exceptionToThrow
  }

  public async fails(): Promise<any> {
    throw this.exceptionToThrow
  }
}
