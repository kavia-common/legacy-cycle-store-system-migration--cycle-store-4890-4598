const TTL_SECONDS = Number(process.env.IDEMPOTENCY_TTL_SECONDS || 600);

class IdempotencyStore {
  constructor() {
    this.map = new Map();
    // periodic cleanup
    setInterval(() => this.cleanup(), Math.min(TTL_SECONDS, 60) * 1000).unref();
  }

  set(key, value) {
    const now = Date.now();
    this.map.set(key, { value, expiresAt: now + TTL_SECONDS * 1000 });
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.map.delete(key);
      return null;
    }
    return entry.value;
  }

  cleanup() {
    const now = Date.now();
    for (const [k, v] of this.map.entries()) {
      if (v.expiresAt < now) {
        this.map.delete(k);
      }
    }
  }
}

module.exports = new IdempotencyStore();
