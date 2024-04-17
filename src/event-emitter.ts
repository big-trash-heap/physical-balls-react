export class EventEmitter<T extends Record<string, any>> {
  private events: { [K in keyof T]: Array<(data: T[K]) => void> } = {} as any;

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    return () => {
      this.remove(event, callback);
    };
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }

  remove<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (this.events[event]) {
      const index = this.events[event].indexOf(callback);
      if (index !== -1) {
        this.events[event].splice(index, 1);
      }
    }
  }
}
