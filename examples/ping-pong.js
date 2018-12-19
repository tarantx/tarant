let { Actor, ActorSystem } = require('../dist/index')

class Ping extends Actor {
    constructor() {
        super("Ping")
        this.times = 0
    }

    ping(to) {
        console.log(++this.times, "Ping")
        to.pong(this.self)
    }
}

class Pong extends Actor {
    constructor() {
        super("Pong")
        this.times = 0
    }

    pong(to) {
        console.log(++this.times, "Pong")
        to.ping(this.self)
    }
}

let system = ActorSystem.default()
let ping = system.actorOf(Ping, [])
let pong = system.actorOf(Pong, [])

ping.ping(pong)

setTimeout(() => {
    system.free()
}, 500)