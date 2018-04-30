import "babel-polyfill";
import ActorSystem from "./domain/actor/actor-system";

import drop from "./domain/actor/supervisor/drop"
import restart from "./domain/actor/supervisor/restart"
import retry from "./domain/actor/supervisor/retry"

ActorSystem.Supervisor = { drop, restart, retry };
export default ActorSystem;
