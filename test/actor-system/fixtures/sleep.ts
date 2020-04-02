/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default async function sleep(ms: number): Promise<any> {
  return await new Promise((ok) => {
    setTimeout(ok, ms)
  })
}
