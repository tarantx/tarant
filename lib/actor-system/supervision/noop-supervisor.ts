import { Actor } from '../..'
import IActorSupervisor from './actor-supervisor'

export default class NoopActorSupervisor implements IActorSupervisor {
  public supervise(actor: Actor, exception: any): void {
    return
  }
}
