let { Actor, ActorSystem, ActorSystemConfigurationBuilder } = require('../dist/index')

class Clock extends Actor {
    constructor(times, message) {
        super()

        this.times = times
        this.timer = this.schedule(1000, this.tick, [message])
    }

    async tick(message) {
        console.log(this.times, "From clock ", this.id, " message:", message)
        if (--this.times <= 0) {
            this.cancel(this.timer)
        }
    }
}

let system = ActorSystem.for(ActorSystemConfigurationBuilder.define()
    .done())

const clock = system.actorOf(Clock, [10, "Actors are cool"])

setTimeout(() => {
    system.releaseActor(clock)
    console.log('Actor released, no more messages. Wait for 3 more seconds.')
}, 3000)

setTimeout(() => {
    system.free()
}, 6000)