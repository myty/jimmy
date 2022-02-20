// deno run --allow-net ./samples/cli-app/app.ts

import { Mediator } from "./deps.ts";
import { RandomAdviceRequest } from "./requests/random-advice-request.ts";
import handlerDefinitions from "./handlers/index.ts";
import { PublishStrategy } from "../../publish-strategy.ts";

const mediator = new Mediator({
  publishStratey: PublishStrategy.ParallelWhenAll,
  handlerDefinitions: handlerDefinitions,
});

const notificaiton = await mediator.send(new RandomAdviceRequest());
await mediator.publish(notificaiton);
