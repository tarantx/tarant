let { Actor, ActorSystem, Topic } = require('../dist/index')

class SpeakingActor extends Actor {
    constructor(idx) {
        super(idx)
    }

    say(message) {}
}

class HappyActor extends SpeakingActor {
    constructor(idx) {
        super(`happy-${idx}`)
    }

    say(message) {
        console.log(this.id, message, ":D")
    }
}

class SadActor extends SpeakingActor {
    constructor(idx) {
        super(`Sad-${idx}`)
    }

    say(message) {
        console.log(this.id, message, ":(")
    }
}

let system = ActorSystem.default()
let topic = Topic.for(system, "my-topic", SpeakingActor)

for (let i = 0; i < 100; i++) {
    if (i % 2 === 0) {
        topic.subscribe(system.actorOf(HappyActor, [i]))
    } else {
        topic.subscribe(system.actorOf(SadActor, [i]))
    }
}

topic.say("Hi")

setTimeout(() => {
    system.free()
}, 1000)