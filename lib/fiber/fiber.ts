import IProcessor from './processor'

interface IFiberConfiguration {
  resources: [string]
  tickInterval: number
}

export default class Fiber {
  public static with(config: IFiberConfiguration): Fiber {
    return new Fiber(config)
  }

  public readonly name: string
  private readonly configuration: IFiberConfiguration
  private readonly interval: any
  private readonly processors: [IProcessor]

  private constructor(configuration: IFiberConfiguration) {
    this.name = 'fiber-with' + configuration.resources.reduce((aggr, current) => aggr + '-' + current, '')
    this.configuration = configuration
    this.interval = setInterval(this.tick.bind(this), this.configuration.tickInterval)
    this.processors = ([] as unknown) as [IProcessor]
  }

  public free(): void {
    clearInterval(this.interval)
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
