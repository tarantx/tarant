let { Actor, ActorSystem } = require('../dist/index')

let sleep = async (time) => new Promise((resolve) => setTimeout(resolve, time))
let currentTime = +(new Date())
let timestamp = () => ((+new Date()) - currentTime)

class Ping extends Actor {
    constructor() {
        super("Ping")
        this.times = 0
    }

    async ping(to) {
        console.log(++this.times, timestamp(), "Ping")
        to.pong(this.self)
        return await sleep(100)
    }
}

class Pong extends Actor {
    constructor() {
        super("Pong")
        this.times = 0
    }

    async pong(to) {
        console.log(++this.times, timestamp(), "Pong")
        to.ping(this.self)
        return await sleep(100)
    }
}

let system = ActorSystem.default()
let ping = system.actorOf(Ping, [])
let pong = system.actorOf(Pong, [])

ping.ping(pong)

setTimeout(() => {
    system.free()
}, 1000)