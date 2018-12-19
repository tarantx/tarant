/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default async function waitFor<T>(fn: () => Promise<T>): Promise<T> {
  const r = fn()
  jest.advanceTimersByTime(100)
  return await r
}
