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
