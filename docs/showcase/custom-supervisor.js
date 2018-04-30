let ActorSystem = require("../../dist/wind.cjs");

let supervisor = (actorSystem, actor, error) => {
    switch (error) {
        case 0:
            return ActorSystem.Supervisor.drop;
            break;
        case 1:
        case 2:
        case 3:
        case 4:
            return ActorSystem.Supervisor.retry(3);
            break;
        default:
            return ActorSystem.Supervisor.restart;
    }
};

let system = new ActorSystem(undefined, supervisor);
system.start();

let rand = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

class FailingActor extends system.Actor {
    onReceive(message) {
        let r = rand(0, 5);
        if (r !== 5) {
            throw r;
        }

        console.log({ generatedNumber: r, retries: message.retries || 0, receivedNumber: message.message });
    }
}

let actor = new FailingActor();
for (let i = 0; i < 10; i++) {
    system.tell(actor.id, i);
}

system.stop();