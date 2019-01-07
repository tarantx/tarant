import Actor, { IActor } from './actor'
import ActorProxy from './actor-proxy'
import { IEvent, IEventSourced, IEventToApply } from './event-sourcing/event-sourced'

export interface IEventSourcedActor extends IActor, IEventSourced {}

export class EventSourcedActor extends Actor implements IEventSourcedActor {
  private readonly events: IEvent[] = []

  public apply(event: (...args: any[]) => void, data: any[]): void {
    event.call(this, ...data)
    this.events.push({ name: event.name, data, version: event.length + 1 })
  }

  public applyAll(...events: IEventToApply[]): void {
    events.forEach(event => this.apply(event.event, event.data))
  }

  public journal(): IEvent[] {
    return [...this.events]
  }

  public source(events: IEvent[]): void {
    this.events.push(...events)
    this.events.forEach(event => {
      ActorProxy.sendAndReturn((this.system as any).mailbox, this.id, event.name, event.data)
    })
  }

  public version(): number {
      return this.events.length + 1
  }
}
