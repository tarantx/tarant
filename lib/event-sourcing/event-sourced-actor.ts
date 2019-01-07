/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor, { IActor } from '../actor-system/actor'
import ActorMessage from '../actor-system/actor-message'
import Mailbox from '../mailbox/mailbox'
import Message from '../mailbox/message'
import { IEvent, IEventSourced, IEventToApply } from './event-sourced'

const JOURNAL = '/journal/'
const FAMILY = '/journal/family/'
const STREAM = '/stream/'

export interface IEventSourcedActor extends IActor, IEventSourced {}

export abstract class EventSourcedActor extends Actor implements IEventSourcedActor {
  private readonly events: IEvent[] = []

  public apply(event: (...args: any[]) => void, data: any[], name: string | undefined): void {
    event.call(this, ...data)
    const eventToApply = {
      data,
      family: this.constructor.name,
      name: event.name || name!,
      stream: this.id,
      version: event.length + 1,
    }

    this.events.push(eventToApply)
    this.materializers.forEach(m => m.onAppliedEvent(this, eventToApply))
    const mailbox = (this.system as any).mailbox as Mailbox<ActorMessage>
    ;[JOURNAL, FAMILY + this.constructor.name, FAMILY + this.constructor.name + STREAM + this.id].forEach(partition => {
      mailbox.push(
        Message.of(
          partition,
          ActorMessage.of(
            event.name || name!,
            data,
            r => {
              return
            },
            r => {
              return
            },
          ),
        ),
      )
    })
  }

  public applyAll(...events: IEventToApply[]): void {
    events.forEach(event => this.apply(event.event, event.data, event.event.name || event.name!))
  }

  public journal(): IEvent[] {
    return [...this.events]
  }

  public source(events: IEvent[]): void {
    events.forEach(event => {
      (this as any)[event.name].call(this, ...event.data)
      this.events.push(event)
    })
  }

  public subscribeToJournal(): void {
    this.partitionSet.add(JOURNAL)
    this.refreshMailbox()
  }

  public subscribeToFamily(family: new (...args: any[]) => any): void {
    this.partitionSet.add(FAMILY + family.name)
    this.refreshMailbox()
    return
  }

  public subscribeToStream(stream: IEventSourced): void {
    this.partitionSet.add(FAMILY + stream.ref.constructor.name + STREAM + stream.ref.id)
    this.refreshMailbox()
    return
  }

  public version(): number {
    return this.events.length + 1
  }
}
