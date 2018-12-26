/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import IProcessor from './processor'

interface IFiberConfiguration {
  resources: string[]
  tickInterval: number
}

export default class Fiber {
  public static with(config: IFiberConfiguration): Fiber {
    return new Fiber(config)
  }
  public readonly name: string

  private readonly configuration: IFiberConfiguration
  private readonly timerId: NodeJS.Timer
  private readonly processors: IProcessor[] = []

  private constructor(configuration: IFiberConfiguration) {
    const { resources, tickInterval } = configuration
    this.configuration = configuration
    this.name = `fiber-with${resources.reduce((aggregation, current) => `${aggregation}-${current}`, '')}`
    this.timerId = setInterval(this.tick.bind(this), tickInterval)
  }

  public free(): void {
    clearInterval(this.timerId)
  }

  public acquire(processor: IProcessor): boolean {
    if (processor.requirements.every(req => this.configuration.resources.indexOf(req) !== -1)) {
      this.processors.push(processor)
      return true
    }

    return false
  }

  private tick(): void {
    this.processors.forEach(p => p.process())
  }
}
