# Jimmy

This is a simple library for using the mediator pattern in your typescript and deno projects. While not entirely a true port, the MediatR library for .NET is a direct influence.

## Why Jimmy?

1. Former US President Jimmy Carter was known for his ability at being a great mediator.
2. The .NET Core library [MediatR](https://github.com/jbogard/MediatR) was written by Jimmy Bogard.
3. Coicdence?  I think not.

## Example Usage

### Deno

```ts
import { Mediator, Request } from "https://deno.land/x/jimmy@v0.1.0-preview3/mod.ts";

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
