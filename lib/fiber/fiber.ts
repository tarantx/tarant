import IProcessor from './processor'

interface IFiberConfiguration {
  resources: [string]
  pollInterval: number
}

export default class Fiber {
  public static with(config: IFiberConfiguration): Fiber {
    return new Fiber(config)
  }

  public readonly name: string
  private readonly configuration: IFiberConfiguration

  private constructor(configuration: IFiberConfiguration) {
    this.name = 'fiber-with' + configuration.resources.reduce((aggr, current) => aggr + '-' + current, '')
    this.configuration = configuration
  }

  public free(): void {
    return
  }

  public acquire(processor: IProcessor): boolean {
    return processor.requirements.every(req => this.configuration.resources.indexOf(req) !== -1)
  }
}
