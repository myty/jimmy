# Jimmy

This is a simple library for using the mediator pattern in your typescript and
deno projects. While not entirely a true port, the MediatR library for .NET is a
direct influence.

## Why Jimmy?

1. Former US President Jimmy Carter was known for his ability at being a great
   mediator.
2. The .NET Core library [MediatR](https://github.com/jbogard/MediatR) was
   written by Jimmy Bogard.
3. Coicdence? I think not.

## Installation

### Node.js

```bash
# npm
npm install --save jimmy-js

# yarn
yarn add jimmy-js
```

### Deno

```bash
import { Mediator, Request, Notification } from "https://deno.land/x/jimmy/mod.ts";
```

## Usage

```ts
const mediator = new Mediator();

class TestRequest extends Request<Promise<string>> {
  constructor(public name: string) {
    super();
  }
}

mediator.handle(
  TestRequest,
  (request) => Promise.resolve(`Hello, ${request.name}!`),
);

const response = await mediator.send(new TestRequest("Jimmy"));

console.log(response); // "Hello, Jimmy!"
```

## Progress

Jimmy is inspired by the [MediatR](https://github.com/jbogard/MediatR) project,
so here's what's been implemented:

- [x] Request/Response messages
- [x] Notification messages
- [x] Publish Strategies (Notifications)

## Basics

Just like MediatR, Jimmy has two kinds of messages it dispatches:

- Request/response messages, dispatched to a single handler
- Notification messages, dispatched to multiple handlers

### Request/Response

The request/response interface handles both command and query scenarios. First,
create a message:

```ts
class Ping extends Request<Promise<string>> {}
```

Next, register a handler:

```ts
mediator.handle(Ping, (request) => Promise.resolve("Pong"));
```

Finally, send a message through the mediator:

```ts
const response = await mediator.send(new Ping());
console.log(response); // "Pong"
```

In the case your message does not require a response, use
`Request<Promise<void>>` as your base class :

```ts
class OneWay extends Request<Promise<void>> {}
mediator.handle(OneWay, () => {
  // Twiddle thumbs
  Promise.resolve();
});
```

Or if the request is completely synchronous, inherit from the base `Request`
class without any generic parameters. `void` is the default return type.

```ts
class Ping extends Request {}
mediator.handle(Ping, () => "Pong");
```

### Notifications

For notifications, first create your notification message:

```ts
class Ping extends Notification {}
```

Next, register zero or more handlers for your notification:

```ts
mediator.handle(Ping, (notification) => {
   console.log("Pong 1");
   return Promsie.resolve();
}

mediator.handle(Ping, (notification) => {
   console.log("Pong 2");
   return Promsie.resolve();
}
```

Finally, publish your message via the mediator:

```ts
await mediator.publish(new Ping());
```

#### Publish Strategies

The default implementation of Publish loops through the notification handlers
and awaits each one. This ensures each handler is run after one another.

Depending on your use-case for publishing notifications, you might need a
different strategy for handling the notifications. Maybe you want to publish all
notifications in parallel, or wrap each notification handler with your own
exception handling logic.
