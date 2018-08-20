let ActorSystem = require("../../dist/wind.cjs");

let system = ActorSystem.Builder().build();
system.start();

let sleep = async (time) => await new Promise(r => setTimeout(r, time));
let startTime = +new Date();

let point = () => ((+new Date()) - startTime) / 1000;

class DelayedPrint extends system.Actor {
    constructor(name, delay) {
        super(name, {name, delay});
        this.subscribe("messages");
    }

    async onReceive(message) {
        return await sleep(this.delay)
            .then(_ => console.log(point() + " - " + this.name + ": " + message));
    }
}

new DelayedPrint("Foo", 500);
new DelayedPrint("Bar", 1000);
new DelayedPrint("Baz", 2000);

for (let i = 0; i < 10; i++) {
    system.eventBus.publish("messages", "Hello " + i)
}

system.stop();