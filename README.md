# Jimmy

This is a simple library for using the mediator pattern in your typescript and deno projects.  It is meant to be a direct port of the Mediatr library for .NET Core.

## Example Usage

### Deno

```ts
import { Mediator, Request } from "https://deno.land/x/jimmy@v0.1.0/mod.ts";

const mediator = new Mediator();

class TestRequest extends Request<string> {
    constructor(public name: string) { }
}

mediator.handle(TestRequest, (request: TestRequest) => {
    return `Hello ${request.name}`;
});

mediator.send(new TestRequest("Jimmy")).then(response => {
    console.log(response);
});
```
