let { Actor, ActorSystem, Topic } = require('../dist/index')

class Listener extends Actor {
    constructor(idx) {
        super("" + idx)
    }

    listenToMessage(message) {
        console.log(this.id, message)
    }
}
let system = ActorSystem.default()
let topic = Topic.for(system, "my-topic", Listener)

for (let i = 0; i < 100; i++) {
    topic.subscribe(system.actorOf(Listener, [i]))
}

topic.listenToMessage("Hey!")

setTimeout(() => {
    system.free()
}, 1000)