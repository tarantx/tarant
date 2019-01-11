## Classes

<dl>
<dt><a href="#ActorMessage">ActorMessage</a></dt>
<dd><p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p></dd>
<dt><a href="#Actor">Actor</a></dt>
<dd><p>Class that must be extended by all actors. All defined public methods in actors should be
asynchronous (return a Promise<T>) or return void.</p></dd>
<dt><a href="#NoopActorSupervisor">NoopActorSupervisor</a></dt>
<dd><p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p></dd>
<dt><a href="#Fiber">Fiber</a></dt>
<dd><p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p></dd>
<dt><a href="#Message">Message</a></dt>
<dd><p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p></dd>
<dt><a href="#Subscription">Subscription</a></dt>
<dd><p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p></dd>
</dl>

## Members

<dl>
<dt><a href="#_default">_default</a></dt>
<dd><p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p></dd>
</dl>

<a name="ActorMessage"></a>

## ActorMessage
<p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p>

**Kind**: global class  
<a name="Actor"></a>

## Actor
<p>Class that must be extended by all actors. All defined public methods in actors should be
asynchronous (return a Promise<T>) or return void.</p>

**Kind**: global class  

* [Actor](#Actor)
    * [.onReceiveMessage(message)](#Actor+onReceiveMessage)
    * [.supervise(actor, exception, message)](#Actor+supervise)
    * [.schedule(interval, fn, values)](#Actor+schedule)
    * [.scheduleOnce(timeout, fn, values)](#Actor+scheduleOnce)
    * [.cancel(cancellable)](#Actor+cancel)
    * [.actorOf(classFn, values)](#Actor+actorOf)

<a name="Actor+onReceiveMessage"></a>

### actor.onReceiveMessage(message)
<p>Method called by the mailbox when there are messages to be processed. This should
not be overriden by the actor.</p>

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Description |
| --- | --- |
| message | <p>Message received from the mailbox</p> |

<a name="Actor+supervise"></a>

### actor.supervise(actor, exception, message)
<p>Supervision method, called when a child actor failed.
The default strategy is to delegate the supervision to this actor supervisor.</p>

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Description |
| --- | --- |
| actor | <p>Actor that raised the exception</p> |
| exception | <p>Exception that raised the actor</p> |
| message | <p>Message that we failed to process</p> |

<a name="Actor+schedule"></a>

### actor.schedule(interval, fn, values)
<p>Schedules a message to this actor every {interval} milliseconds. Returns a cancellable, that
can be passed to #cancel to stop the scheduled message.</p>

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**See**: Actor#cancel  

| Param | Description |
| --- | --- |
| interval | <p>Interval, in ms, between messages</p> |
| fn | <p>Message to send to this current actor, in form of a method reference (like this.myMethod)</p> |
| values | <p>Parameters to pass with the message (parameters of the method to call)</p> |

<a name="Actor+scheduleOnce"></a>

### actor.scheduleOnce(timeout, fn, values)
<p>Schedules a message to this actor once, after {timeout} milliseconds. Returns a cancellable, that
can be passed to #cancel to stop the scheduled message.</p>

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**See**: Actor#cancel  

| Param | Description |
| --- | --- |
| timeout | <p>Time to send the message, in ms</p> |
| fn | <p>Message to send to this current actor, in form of a method reference (like this.myMethod)</p> |
| values | <p>Parameters to pass with the message (parameters of the method to call)</p> |

<a name="Actor+cancel"></a>

### actor.cancel(cancellable)
<p>Cancels a scheduled action created by #schedule or #scheduleOnce</p>

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**See**

- Actor#schedule
- Actor#scheduleOnce


| Param | Description |
| --- | --- |
| cancellable | <p>Cancellable reference</p> |

<a name="Actor+actorOf"></a>

### actor.actorOf(classFn, values)
<p>Creates a child actor of this actor. The current actor will behave as the supervisor
of the created actor.</p>

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Description |
| --- | --- |
| classFn | <p>Constructor of the actor to build</p> |
| values | <p>Values to pass as the constructor parameters</p> |

<a name="NoopActorSupervisor"></a>

## NoopActorSupervisor
<p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p>

**Kind**: global class  
<a name="Fiber"></a>

## Fiber
<p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p>

**Kind**: global class  
<a name="Message"></a>

## Message
<p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p>

**Kind**: global class  
<a name="Subscription"></a>

## Subscription
<p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p>

**Kind**: global class  
<a name="_default"></a>

## \_default
<p>Copyright (c) 2018-present, tarant</p>
<p>This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.</p>

**Kind**: global variable  
