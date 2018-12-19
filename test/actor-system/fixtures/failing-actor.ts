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
