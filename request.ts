export abstract class Request<TResponse = unknown> {
  private static _requestTypeId: symbol;

  static get requestTypeId() {
    if (
      !Object.getOwnPropertyDescriptor(this, "_requestTypeId") ||
      this._requestTypeId == null
    ) {
      Object.defineProperty(this, "_requestTypeId", {
        value: Symbol(`Request-${this.name}`),
      });
    }

    return this._requestTypeId;
  }

  type(): TResponse {
    throw new Error("Method not implemented.");
  }
}
