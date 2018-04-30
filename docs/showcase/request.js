let ActorSystem = require("../../dist/wind.cjs");

let system = new ActorSystem();
system.start();

class Person extends system.Actor {
    constructor(name) {
        super({name});
        this.subscribe("names");
    }

    onReceive() {
        return { name: this.name };
    }
}

new Person("Foo");
new Person("Bar");
new Person("Baz");

class Manager extends system.Actor {
    async onReceive() {
        let names = await this.request("names", {});
        console.log(names);
    }
}

let manager = new Manager();
system.tell(manager.id);

// Subscriptions are not atomic, so we need to wait at least to the end of the event loop to stop the actor system.
setTimeout(() => system.stop(), 0);
