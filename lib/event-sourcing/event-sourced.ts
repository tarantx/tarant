/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface IEvent {
  family: string
  stream: string
  name: string
  data: any[]
  version: number
}

export interface IEventToApply {
  event: (...args: any[]) => void
  name: string | undefined
  data: any[]
}

/**
 * Base interface for all event sourced entities.
 */
export interface IEventSourced {
  ref: this
  id: string

  /**
   * Applies an event to the current entity. This should be called with a reference
   * to the event handler, and the parameters as an array. For example:
   *
   * this.apply(this.transactionCommited, [ { amount: 150.0 } ])
   *
   * @param event Event to write in the journal
   * @param data Data to be wrote in the journal along the event information
   */
  apply(event: (...args: any[]) => void, data: any[], name: string): void

  /**
   * Applies a set pf events to the current entity, in the order provided. The entity will
   * not be released to process new messages until all events are applied.
   *
   * @param event Event to write in the journal
   * @param data Data to be wrote in the journal along the event information
   */
  applyAll(...events: IEventToApply[]): void

  /**
   * Returns the journal of processed events. It might happen that a delivered event is still not in the journal
   * because it's pending to be processed.
   */
  journal(): IEvent[]

  /**
   * Sources the entity with a list of events to be processed. They will be eventually processed in guaranteed order.
   * @param events The list of events to process
   */
  source(events: IEvent[]): void

  /**
   * Subscribes to all events in the journal.
   *
   * If an event can not be handled (because there is no method handler with
   * the same name) it wil be ignored.
   */
  subscribeToJournal(): void

  /**
   * Subscribes to all events in the family. A family is the set of all streams for a given
   * entity type.
   *
   * If an event can not be handled (because there is no method handler with
   * the same name) it wil be ignored.
   */
  subscribeToFamily(family: new (...args: any[]) => any): void

  /**
   * Subscribes to all events in the stream. A stream is a potentially infinite set of events that are
   * emited from an entity.
   *
   * If an event can not be handled (because there is no method handler with
   * the same name) it wil be ignored.
   */
  subscribeToStream(stream: IEventSourced): void

  /**
   * Returns the current version of the sourced entity.
   */
  version(): number
}
