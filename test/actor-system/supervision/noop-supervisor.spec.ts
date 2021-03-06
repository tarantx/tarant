/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Actor } from '../../../lib'
import NoopSupervisor from '../../../lib/actor-system/supervision/noop-supervisor'

class FakeActor extends Actor {
  constructor() {
    super()
  }
}

describe('NoopSupervisor', () => {
  const supervisor = new NoopSupervisor()

  it('should return strategy of drop message', () => {
    expect(supervisor.supervise(new FakeActor(), undefined, undefined)).toEqual('drop-message')
  })
})
