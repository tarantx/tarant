let { Actor, ActorSystem } = require('../dist/index')

class Clock extends Actor {
    constructor(times, message) {
        super()

        this.times = times
        this.timer = this.schedule(250, this.tick, [message])
    }

    tick(message) {
        console.log(--this.times, "From clock ", this.id, " message:", message)
        if (this.times <= 0) {
            this.cancel(this.timer)
        }
    }
}

let system = ActorSystem.default()
system.actorOf(Clock, [10, "Actors are cool"])

setTimeout(() => {
    system.free()
}, 3000)