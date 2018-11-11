import Actor from '../../../lib/actor-system/actor'

export default class PingActor extends Actor {
  private readonly name: string

  public constructor(name: string) {
    super(name)

    this.name = name
  }

  public async sayHi(): Promise<string> {
    return this.name
  }
}
