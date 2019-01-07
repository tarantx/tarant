let { ActorSystem, EventSourcedActor } = require('../dist/index')

class Counter extends EventSourcedActor {
    constructor() {
        super()

        this.counter = 0
    }

    addOne() {
        this.apply(this.addedOne, 'addedOne', [this.counter])
    }

    addedOne(baseCounter) {
        this.counter = baseCounter + 1
    }
}

class CounterLogger extends EventSourcedActor {
    constructor() {
        super()

        this.subscribeToFamily(Counter)
        this.logs = []
    }

    addedOne(baseCounter) {
        this.apply(this.loggedCounter, 'loggedCounter', [baseCounter])
    }

    loggedCounter(baseCounter) {
        this.logs.push('Added one from ' + baseCounter)
        console.log("All logs right now", this.logs)
    }
}

class JournalListener extends EventSourcedActor {
    constructor() {
        super()

        this.subscribeToJournal()
    }

    addedOne(baseCounter) {
        console.log("JournalListener received addedOne", baseCounter)
    }

    loggedCounter(baseCounter) {
        console.log("JournalListener received loggedCounter", baseCounter)
    }
}

const system = ActorSystem.default()
const counter = system.actorOf(Counter)
const logger = system.actorOf(CounterLogger)
const journalListener = system.actorOf(JournalListener)

counter.addOne()
counter.addOne()
counter.addOne()
counter.addOne()

setTimeout(() => {
    console.log("Terminating...")
    console.log("Journals:")
    console.log("Counter", counter.ref.journal())
    console.log("Logger", logger.ref.journal())
    system.free()
}, 100)