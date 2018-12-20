# ![logomakr_8cwvt1](https://user-images.githubusercontent.com/3071208/42311453-254a1474-803e-11e8-957a-5c1c8d157b31.png)
[![npm](https://img.shields.io/npm/v/@wind-js/actor.svg)](https://www.npmjs.com/package/@wind-js/actor)
[![Build Status](https://travis-ci.org/wind-js/actor.svg?branch=master)](https://travis-ci.org/@wind-js/actor)
[![Coverage Status](https://coveralls.io/repos/github/wind-js/actor/badge.svg?branch=master)](https://coveralls.io/github/@wind-js/actor?branch=master)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![issues Welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg)
![npm](https://img.shields.io/npm/l/@wind-js/actor.svg)
![GitHub issues](https://img.shields.io/github/issues/wind-js/actor.svg)
![GitHub pull requests](https://img.shields.io/github/issues-pr/wind-js/actor.svg)
![Downloads](https://img.shields.io/npm/dt/@wind-js/actor.svg)

Wind.js is a TypeScript/JavaScript library for building software using the actor system model.

* **Actors are easy to reason about**: An actor is the unit of state and logic of your application.
They are transactional, so you don't need to handle state rollbacks in case of errors.
* **Actors improve performance**: Asynchronous by default, every actor actual communication is non-blocking so slow actors will not block fast actors.
* **Actors are extensible**: As actors are built on top of objects, actor classes can be inherited, 
composed and injected.

## Features

Wind.js implements a rich set of features that makes it suitable for building complex applications.

* Actors are reliable because they are transactional. You don't need to bother yourself with error recovery.
* Actors are performant, as they are pull-based and decoupled from other actors lifecycle.
* Actors are easy to debug. All messages come with information about the sender and all the state information is saved
in a time machine, for further debugging and navigation.
* The Actor System has an event bus. Actors can subscribe, publish and request messages from any topic and subscriptions
can be handled at any time.
* The Actor System is highly extensive. You can add your own supervisor and materializer to add new features like
implicit persistence or rendering of actors.

### Showcase
* [Actors support asynchronous messaging](./examples/ping-pong.js) and answering through Promises. Slow actors will not block fast actors.
* [Actors can schedule tasks](./examples/scheduleds.js) for interval or one-shot delayed actions.
* [Actors are safe and can be recovered with a supervisor](./examples/supervisor.js).
* [Actors can subscribe in a topic in a type-safe way](examples/pubsub.js) for extensible communication.

## Quick start

Creating your first actor system is easy and you don't need to understand everything that is happening under the hood.
First you must install the package:

`npm install @wind-js/actor --save`

Then create your first ActorSystem

```js
let { Actor, ActorSystem } = require('@wind-js/actor')
let system = ActorSystem.default()
```

And create your actor class:

```js
class Ping extends Actor {
    ping() {
        console.log("PING")
    }
}
```

Then you only need to instantiate your actor and send messages to it:

```js
let myPinger = system.actorOf(Ping, [])
myPinger.ping()
```

The application will continue running and processing messages until you stop the actor system:

```js
system.free()
```
If you run the application you will see the following output:

```
PING
```

## Contribution ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) ![Issues Welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg)

PR and issues are always welcome as a quick way of contributing to the project. Remember to be polite, this is a open source
project and ordinary requirements for PRs and issues are also a requirement.

If you want to be a long-term contributor and participate actively on the design of new features on the project, contact
us! Check the package.json to see who you need to contact.

### Logo
Player graphic by <a href="http://www.flaticon.com/authors/pixel-perfect">pixel_perfect</a> from <a href="http://www.flaticon.com/">Flaticon</a> is licensed under <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a>. Check out the new logo that I created on <a href="http://logomakr.com" title="Logo Makr">LogoMakr.com</a> https://logomakr.com/8CWVt1
0
