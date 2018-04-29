## Classes

<dl>
<dt><a href="#ActorSystem">ActorSystem</a></dt>
<dd><p>The Actor System is the class responsible of managing actors and their lifecycle.</p>
</dd>
<dt><a href="#Actor">Actor</a></dt>
<dd><p>An Actor is the unit of state and logic of an Actor System.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#drop">drop(system, actor)</a> ⇒ <code><a href="#Actor">Actor</a></code></dt>
<dd><p>Drops the offending message and rollbacks the provided actor
to the last known state.</p>
</dd>
<dt><a href="#restart">restart(system, actor)</a> ⇒ <code><a href="#Actor">Actor</a></code></dt>
<dd><p>Sets the actor state to the initial state and retries the mailbox.</p>
</dd>
<dt><a href="#retry">retry(retries)</a> ⇒ <code>function</code></dt>
<dd><p>Retries at least {retries} times the offending message before dropping it.</p>
</dd>
</dl>

<a name="ActorSystem"></a>

## ActorSystem
The Actor System is the class responsible of managing actors and their lifecycle.

**Kind**: global class  

* [ActorSystem](#ActorSystem)
    * [new ActorSystem(scheduler, supervisor, materializer, eventBus)](#new_ActorSystem_new)
    * [.Actor](#ActorSystem+Actor)
        * [new ActorSystem#Actor()](#new_ActorSystem+Actor_new)
    * [.getActor(id)](#ActorSystem+getActor) ⇒ [<code>Actor</code>](#Actor)
    * [.killActor(id)](#ActorSystem+killActor)
    * [.start()](#ActorSystem+start)
    * [.stop()](#ActorSystem+stop) ⇒ <code>Promise.&lt;any&gt;</code>
    * [.tell(id, message)](#ActorSystem+tell)
    * [.ask(id, message)](#ActorSystem+ask) ⇒ <code>Promise.&lt;any&gt;</code>

<a name="new_ActorSystem_new"></a>

### new ActorSystem(scheduler, supervisor, materializer, eventBus)

| Param | Type | Description |
| --- | --- | --- |
| scheduler | <code>Scheduler</code> | Custom Scheduler, undefined for default. |
| supervisor | <code>Supervisor</code> | Custom supervisor, defaults to () => drop |
| materializer | <code>Materializer</code> | Custom materializer, defaults to noop. |
| eventBus | <code>EventBus</code> | Custom event bus, defaults to a new Event Bus. |

<a name="ActorSystem+Actor"></a>

### actorSystem.Actor
**Kind**: instance class of [<code>ActorSystem</code>](#ActorSystem)  
**See**: Actor  
<a name="new_ActorSystem+Actor_new"></a>

#### new ActorSystem#Actor()
Returns an Actor class that you can extend. You will need to implement yourself the onReceive method.

<a name="ActorSystem+getActor"></a>

### actorSystem.getActor(id) ⇒ [<code>Actor</code>](#Actor)
Gets an Actor instance by Id

**Kind**: instance method of [<code>ActorSystem</code>](#ActorSystem)  

| Param |
| --- |
| id | 

<a name="ActorSystem+killActor"></a>

### actorSystem.killActor(id)
Kills an actor and unregisters it from the Actor System. This actor will not receiver further messages,but will eventually process the current mailbox.

**Kind**: instance method of [<code>ActorSystem</code>](#ActorSystem)  

| Param |
| --- |
| id | 

<a name="ActorSystem+start"></a>

### actorSystem.start()
Starts the ActorSystem, so it schedules messages. This is mandatory.

**Kind**: instance method of [<code>ActorSystem</code>](#ActorSystem)  
<a name="ActorSystem+stop"></a>

### actorSystem.stop() ⇒ <code>Promise.&lt;any&gt;</code>
Stops gracefully the ActorSystem and all actors.It will delay until all actors has been killed and all mailboxes processed.

**Kind**: instance method of [<code>ActorSystem</code>](#ActorSystem)  
**Returns**: <code>Promise.&lt;any&gt;</code> - Resolved when all actors has been killed.  
<a name="ActorSystem+tell"></a>

### actorSystem.tell(id, message)
Tels a message to an actor.

**Kind**: instance method of [<code>ActorSystem</code>](#ActorSystem)  

| Param |
| --- |
| id | 
| message | 

<a name="ActorSystem+ask"></a>

### actorSystem.ask(id, message) ⇒ <code>Promise.&lt;any&gt;</code>
Asks for a message to an actor.

**Kind**: instance method of [<code>ActorSystem</code>](#ActorSystem)  

| Param |
| --- |
| id | 
| message | 

<a name="Actor"></a>

## Actor
An Actor is the unit of state and logic of an Actor System.

**Kind**: global class  

* [Actor](#Actor)
    * [.receiveMessage(message)](#Actor+receiveMessage)
    * [.kill()](#Actor+kill)
    * [.pull()](#Actor+pull) ⇒ <code>Promise.&lt;any&gt;</code>
    * [.tell(actor, message)](#Actor+tell)
    * [.ask(actor, message)](#Actor+ask) ⇒ <code>Promise.&lt;any&gt;</code>
    * [.navigateTo(index)](#Actor+navigateTo) ⇒ [<code>Actor</code>](#Actor)
    * [.history()](#Actor+history) ⇒ <code>\*</code>
    * [.onReceive(origin, message, answerTo, failOn)](#Actor+onReceive) ⇒ <code>any</code> \| <code>Promise.&lt;any&gt;</code>
    * [.subscribe(topic)](#Actor+subscribe) ⇒ <code>\*</code>
    * [.unsubscribe(topic)](#Actor+unsubscribe)
    * [.publish(topic, message)](#Actor+publish)
    * [.request(topic, message, timeout)](#Actor+request) ⇒ <code>Promise.&lt;any&gt;</code>

<a name="Actor+receiveMessage"></a>

### actor.receiveMessage(message)
Adds a message to the mailbox if the actor is not dead.

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param |
| --- |
| message | 

<a name="Actor+kill"></a>

### actor.kill()
Kills an actor, thus not processing more new messages.

**Kind**: instance method of [<code>Actor</code>](#Actor)  
<a name="Actor+pull"></a>

### actor.pull() ⇒ <code>Promise.&lt;any&gt;</code>
Pulls a new message from the mailbox (if any).

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Returns**: <code>Promise.&lt;any&gt;</code> - With the result of the pull.  
<a name="Actor+tell"></a>

### actor.tell(actor, message)
Tells a message to another actor. The new message will be processed eventually by the receiver. If thereceiver is dead, the message is ignored but this method will not fail.

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**See**: kill  

| Param | Type | Description |
| --- | --- | --- |
| actor | [<code>Actor</code>](#Actor) | The receiver |
| message | <code>any</code> | The message to send |

<a name="Actor+ask"></a>

### actor.ask(actor, message) ⇒ <code>Promise.&lt;any&gt;</code>
Asks for a response to another actor. The message will be processed eventually and the promise resolved withthe return value of the receiver's onReceive.If any of the actors are dead, the message will not be delivered, thus returning a new Promise ofundefined.

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Returns**: <code>Promise.&lt;any&gt;</code> - The response of the receiver actor  
**See**: kill  

| Param | Type | Description |
| --- | --- | --- |
| actor | [<code>Actor</code>](#Actor) | receiver |
| message | <code>any</code> | The message to send |

<a name="Actor+navigateTo"></a>

### actor.navigateTo(index) ⇒ [<code>Actor</code>](#Actor)
Changes the actor state to the state saved at {index}.

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Returns**: [<code>Actor</code>](#Actor) - The same actor.  

| Param |
| --- |
| index | 

<a name="Actor+history"></a>

### actor.history() ⇒ <code>\*</code>
Returns the history of changes of an actor.

**Kind**: instance method of [<code>Actor</code>](#Actor)  
<a name="Actor+onReceive"></a>

### actor.onReceive(origin, message, answerTo, failOn) ⇒ <code>any</code> \| <code>Promise.&lt;any&gt;</code>
The method that processes messages. This must be implemented by all Actors.

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Type | Description |
| --- | --- | --- |
| origin | [<code>Actor</code>](#Actor) \| [<code>ActorSystem</code>](#ActorSystem) | The sender of the message. |
| message | <code>any</code> | The received message. |
| answerTo | <code>function</code> | Function to call to answer a promise. You should return a promise instead of calling this. |
| failOn | <code>function</code> | Function to call to reject a promise. You should throw an exception or return a rejected promise instead. |

<a name="Actor+subscribe"></a>

### actor.subscribe(topic) ⇒ <code>\*</code>
Subscribes to a topic, enqueueing all received messages of this topic to the mailbox.

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>string</code> | The topic name. |

<a name="Actor+unsubscribe"></a>

### actor.unsubscribe(topic)
Unsubscribes from a topic, ignoring further messages on this topic.

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Type |
| --- | --- |
| topic | <code>string</code> | 

<a name="Actor+publish"></a>

### actor.publish(topic, message)
Publishes a message to a topic. Messages in a topic will be eventually processed by all subscribed actors.

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Type |
| --- | --- |
| topic | <code>string</code> | 
| message | <code>any</code> | 

<a name="Actor+request"></a>

### actor.request(topic, message, timeout) ⇒ <code>Promise.&lt;any&gt;</code>
Request a response from all actors subscribed to a topic for a given message.For example, let's imagine that we have the following two actors subscribed to the topic 'ops':Actor1 => given a number :: returns number + 1Actor2 => given a number :: returns number + 2If we request a message like:MyActor.request('ops', 1);It will return a Promise, that eventually will return [2, 3] (the order may differ).If any of the actors doesn't respond in the given timeout, the promise will be rejected, ignoring anyresponse. The state of other actors will not rollback.

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| topic | <code>string</code> |  |  |
| message | <code>string</code> |  |  |
| timeout | <code>number</code> | <code>1000</code> | in milliseconds |

<a name="drop"></a>

## drop(system, actor) ⇒ [<code>Actor</code>](#Actor)
Drops the offending message and rollbacks the provided actorto the last known state.

**Kind**: global function  
**Returns**: [<code>Actor</code>](#Actor) - The expected actor state  

| Param | Type | Description |
| --- | --- | --- |
| system | [<code>ActorSystem</code>](#ActorSystem) | Parent ActorSystem |
| actor | [<code>Actor</code>](#Actor) | Actor that failed |

<a name="restart"></a>

## restart(system, actor) ⇒ [<code>Actor</code>](#Actor)
Sets the actor state to the initial state and retries the mailbox.

**Kind**: global function  
**Returns**: [<code>Actor</code>](#Actor) - The expected actor state  

| Param | Type | Description |
| --- | --- | --- |
| system | [<code>ActorSystem</code>](#ActorSystem) | The parent Actor System |
| actor | [<code>Actor</code>](#Actor) | The offending actor |

<a name="retry"></a>

## retry(retries) ⇒ <code>function</code>
Retries at least {retries} times the offending message before dropping it.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| retries | <code>number</code> | Number of retries |

