let ActorSystem = require("../../dist/wind.cjs");

let system = new ActorSystem();
system.start();

class PrintPlus1Actor extends system.Actor {
    constructor() {
        super();
        this.subscribe("numbers");
    }

    onReceive(message) {
        console.log("From PrintPlus1Actor:  " + (message + 1));
    }
}

class PrintMinus1Actor extends system.Actor {
    constructor() {
        super();
        this.subscribe("numbers");
    }

    onReceive(message) {
        console.log("From PrintMinus1Actor: " + (message - 1));
    }
}

new PrintPlus1Actor();
new PrintMinus1Actor();

for (let i = 0; i < 10; i++) {
    system.eventBus.publish("numbers", i)
}

system.stop();