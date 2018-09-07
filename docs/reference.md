## Classes

<dl>
<dt><a href="#ActorSystem">ActorSystem</a></dt>
<dd><p>The Actor System is the class responsible of managing actors and their lifecycle.</p>
</dd>
<dt><a href="#Mailbox">Mailbox</a></dt>
<dd><p>Copyright (c) 2018-present, wind-js</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#_lock">_lock</a></dt>
<dd><p>An Actor is the unit of state and logic of an Actor System.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#drop">drop(system, actor)</a> ⇒ <code>Actor</code></dt>
<dd><p>Drops the offending message and rollbacks the provided actor
to the last known state.</p>
</dd>
<dt><a href="#restart">restart(system, actor)</a> ⇒ <code>Actor</code></dt>
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
    * [.Actor](#ActorSystem+Actor)
        * [new ActorSystem#Actor()](#new_ActorSystem+Actor_new)
    * [.getActor(id)](#ActorSystem+getActor) ⇒ <code>Actor</code>
    * [.killActor(id)](#ActorSystem+killActor)
    * [.start()](#ActorSystem+start)
    * [.stop()](#ActorSystem+stop) ⇒ <code>Promise.&lt;any&gt;</code>
    * [.tell(id, message)](#ActorSystem+tell)
    * [.ask(id, message)](#ActorSystem+ask) ⇒ <code>Promise.&lt;any&gt;</code>

<a name="ActorSystem+Actor"></a>

### actorSystem.Actor
**Kind**: instance class of [<code>ActorSystem</code>](#ActorSystem)  
**See**: Actor  
<a name="new_ActorSystem+Actor_new"></a>

#### new ActorSystem#Actor()
Returns an Actor class that you can extend. You will need to implement yourself the onReceive method.

<a name="ActorSystem+getActor"></a>

### actorSystem.getActor(id) ⇒ <code>Actor</code>
Gets an Actor instance by Id

**Kind**: instance method of [<code>ActorSystem</code>](#ActorSystem)  

| Param |
| --- |
| id | 

<a name="ActorSystem+killActor"></a>

### actorSystem.killActor(id)
Kills an actor and unregisters it from the Actor System. This actor will not receiver further messages,
but will eventually process the current mailbox.

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
Stops gracefully the ActorSystem and all actors.
It will delay until all actors has been killed and all mailboxes processed.

**Kind**: instance method of [<code>ActorSystem</code>](#ActorSystem)  
**Returns**: <code>Promise.&lt;any&gt;</code> - Resolved when all actors has been killed.  
<a name="ActorSystem+tell"></a>

### actorSystem.tell(id, message)
Sends a message to an actor.

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

<a name="Mailbox"></a>

## Mailbox
Copyright (c) 2018-present, wind-js

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

**Kind**: global class  
<a name="_lock"></a>

## _lock
An Actor is the unit of state and logic of an Actor System.

**Kind**: global variable  
<a name="drop"></a>

## drop(system, actor) ⇒ <code>Actor</code>
Drops the offending message and rollbacks the provided actor
to the last known state.

**Kind**: global function  
**Returns**: <code>Actor</code> - The expected actor state  

| Param | Type | Description |
| --- | --- | --- |
| system | [<code>ActorSystem</code>](#ActorSystem) | Parent ActorSystem |
| actor | <code>Actor</code> | Actor that failed |

<a name="restart"></a>

## restart(system, actor) ⇒ <code>Actor</code>
Sets the actor state to the initial state and retries the mailbox.

**Kind**: global function  
**Returns**: <code>Actor</code> - The expected actor state  

| Param | Type | Description |
| --- | --- | --- |
| system | [<code>ActorSystem</code>](#ActorSystem) | The parent Actor System |
| actor | <code>Actor</code> | The offending actor |

<a name="retry"></a>

## retry(retries) ⇒ <code>function</code>
Retries at least {retries} times the offending message before dropping it.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| retries | <code>number</code> | Number of retries |

