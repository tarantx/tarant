import { v4 as uuid } from 'uuid'
import Actor from '../../../lib/actor-system/actor'
import IActorSupervisor, { SupervisionResponse } from '../../../lib/actor-system/supervision/actor-supervisor'
import FailingActor from './failing-actor'

export default class ParentOfFailingActorActor extends Actor {
  private readonly customSupervisor: IActorSupervisor

  public constructor(supervisor: IActorSupervisor) {
    super(uuid())
    this.customSupervisor = supervisor
  }

  public supervise(actor: Actor, exception: any, message: any): SupervisionResponse {
    return this.customSupervisor.supervise(actor, exception, message)
  }

  public async newFailingActor(ofException: any): Promise<FailingActor> {
    return this.actorOf(FailingActor, [ofException])
  }
}
