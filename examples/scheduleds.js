let { Actor, ActorSystem } = require('../dist/index')

let sleep = async ms => await new Promise(r => setTimeout(r, ms))

class Clock extends Actor {
    constructor(times, message) {
        super()

        this.times = times
        this.timer = this.schedule(100, this.self.tick, [message])
    }

    async tick(message) {
        await sleep(500)
        if (--this.times <= 0) {
            this.cancel(this.timer)
            return
        }
        console.log(this.times, "From clock ", this.id, " message:", message)
    }
}

let system = ActorSystem.default()
system.actorOf(Clock, [10, "Actors are cool"])

setTimeout(() => {
    system.free()
}, 10000)