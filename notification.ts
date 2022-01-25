export abstract class Notification {
  private static _notificationTypeId: symbol;

  static get notificationTypeId() {
    if (
      !Object.getOwnPropertyDescriptor(this, "_notificationTypeId") ||
      this._notificationTypeId == null
    ) {
      Object.defineProperty(this, "_notificationTypeId", {
        value: Symbol(`Notification-${this.name}`),
      });
    }

    return this._notificationTypeId;
  }
}
