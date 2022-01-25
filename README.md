# Jimmy

This is a simple library for using the mediator pattern in your typescript and deno projects.  It is meant to be a direct port of the Mediatr library for .NET Core.

## Example Usage

```ts
import { Mediator } from "./mediator";
import { Request } from "./request";

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