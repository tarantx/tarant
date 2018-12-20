let { Actor, ActorSystem, Topic } = require('../dist/index')

class SomeActor extends Actor {
    constructor(idx) {
        super("" + idx)
    }

    thisCanBeAnyMethod(message) {
        console.log(this.id, message)
    }
}
let system = ActorSystem.default()
let topic = Topic.for(system, "my-topic", SomeActor)

for (let i = 0; i < 100; i++) {
    topic.subscribe(system.actorOf(SomeActor, [i]))
}

topic.thisCanBeAnyMethod("Hey!")

setTimeout(() => {
    system.free()
}, 1000)