/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor from '../../../lib/actor-system/actor'
import sleep from '../../fixtures/sleep'

export default class SemaphoreActor extends Actor {
  private current: number
  private readonly callback: (n: number) => void

  public constructor(id: string, callback: (n: number) => void) {
    super(id)

    this.current = 0
    this.callback = callback
  }

  public async runFor(ms: number): Promise<any> {
    this.current++
    this.callback(this.current)
    await sleep(ms)
    this.current--
  }
}
