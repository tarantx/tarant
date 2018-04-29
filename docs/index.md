Welcome!
=======

If you want to check a fast overview on how to setup your first application using wind.js, check out [here](/README.md).

Architecture
--------------------------

An Actor System is not that different to an object ecosystem like one you could find on different platforms like ES6, Java, C# or Python. However, there are a set of rules that an actor system needs to fullfill to be useful:

* **Actors lifecycle is bound to business, not to hardware requirements:** An actor is only freed when it's killed by some business rule.
* **Actors are agnostic of how communication works:** Calling an actor from a remote machine or a local machine, using HTTP or a binary encoded protocol is transparent to the actor itself.
* **Actors are pull-based:** Actors balance how they will use they own resources, usually pulling the messages at the pace is more suitable for their needs.

### The Actor System

An Actor System is the environment where actors live. It's a composition of:

* **A Supervisor**: A supervisor is a function that handles errors on Actors and can decide a strategy of recovery. It will be covered later.
* **A Scheduler**: Responsible of deciding when to give permissions to the actors to pull messages from their mailboxes.
* **A Materializer**: Responsible of deciding how an actor interacts with the infrastructure. _See the Actor Anatomy later for further details_
* **An Event Bus**: That handles subscriptions and messages on topics.

All actors are instantiated under an Actor System.

#### Supervisors

A Supervisor is a function with the following signature:

```js
(ActorSystem, Actor, Error) => (ActorSystem, Actor) => void
```

The signature looks complex, but let's take a look deeper and we'll see that it's actually pretty simple.

A Supervisor is a function bounded to an Actor System, that is called when an actor raises an unhandled error. The supervisor will receive the current ActorSystem, the Actor that failed, and the current failure.

With that information, the supervisor should return a function that will decide the current recovery strategy of the error. For example, the default supervision strategy is to drop the message that failed and return the actor to the last known valid state.

You can see bundled supervisor strategies at [here](/lib/domain/actor/supervisor/):

* **[drop](/lib/domain/actor/supervisor/drop.js)**: Will rollback the actor to the last known valid state and drop the message.
* **[restart](/lib/domain/actor/supervisor/restart.js)**: Will rollback the actor to the first recorded state maintaining the mailbox.
* **[retry](/lib/domain/actor/supervisor/retry.js)**: Will rollback the actor to the last known valid state and will retry the mssage until actorSystem.maxRetries is reached, then the drop strategy will be used.

The default supervision strategy is **drop**.

### The Actor Anatomy

An Actor is built by:

* A Mailbox
* A Materializer
* A TimeMachine
* A set of subscriptions
* A State

_**For more fun** you can check the code at [actor.js](/lib/domain/actor/actor.js)_

![actor](https://user-images.githubusercontent.com/1822138/39409821-faed94f0-4bed-11e8-8c05-3741d7fbb322.png)

#### Mailbox

The mailbox is a queue of messages that the actor is expected to process. The mailbox guarantees that messages
are only processed once and in order.

#### Materializer

The materializer is a set of hooks in the Actor lifecycle that can be used for different purpouses. Example of
materializers can be renderers (like using React to render an Actor), persistence (like saving the actor state in MongoDB)
and so on.

The lifecycle of the actor is the following:

![lifecycle](https://user-images.githubusercontent.com/1822138/39409919-1d49c2b6-4bef-11e8-8016-78650cd9d326.png)

* **OnActivate**: When the actor is instantiated for the first time and ready to start pulling messages.
* **onReceiveMessage**: When a new message arrives to the mailbox.
* **OnBeforePullingMessage**: When an actor is ready to pull a message.
* **OnAfterMessageProcessed**: When the current message has been processed without errors
* **OnError**: When the actor failed to process the pulled message. _OnError_ is not a supervisor, it can not change the state of the current actor and can not recover from the error.
* **OnDeactive**: When the actor is freed.
* **OnSubscribe**: When an actor subscribes to a topic.
* **OnUnsubscribe**: When an actor unsubscribes from a topic.

#### TimeMachine

The TimeMachine stores the history of states of an actor. It ensures reliability and ability to debug actors, as you can
navigate through the TimeMachine and see all the states in time for a given Actor.

#### Subscriptions

Actors can subscribe to topics on the parent Actor System. All messages sent to any of the subscribed topics will be enqueued to the actor's mailbox and processed as a normal messages. Actors can also publish messages to topics without
the need of subscribing to them.

#### State

Actors are stateful and transactional, so any state saved in the actor will be materialized and saved.

