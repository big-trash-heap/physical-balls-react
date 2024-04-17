const DEGREES_TO_RADIAN_COEFICENT = Math.PI / 180;
const RADIAN_TO_DEGREES_COEFICENT = 180 / Math.PI;
const EPSILON = Number.EPSILON;

export class Vec2 {
  private constructor(public readonly x: number, public readonly y: number) {}

  static create(x: number, y: number): Vec2 {
    return new Vec2(x, y);
  }

  static speed(angle: number, speed: number): Vec2 {
    return new Vec2(
      Math.cos(angle * DEGREES_TO_RADIAN_COEFICENT) * speed,
      Math.sin(angle * DEGREES_TO_RADIAN_COEFICENT) * speed
    );
  }

  static zero = new Vec2(0, 0);
  static one = new Vec2(1, 1);

  get comps() {
    return [this.x, this.y] as [number, number];
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  add(other: number | Vec2): Vec2 {
    if (typeof other === "number") {
      return new Vec2(this.x + other, this.y + other);
    }
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  subtract(other: number | Vec2): Vec2 {
    if (typeof other === "number") {
      return new Vec2(this.x - other, this.y - other);
    }
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  multiply(other: number | Vec2): Vec2 {
    if (typeof other === "number") {
      return new Vec2(this.x * other, this.y * other);
    }
    return new Vec2(this.x * other.x, this.y * other.y);
  }

  rotate(angle: number): Vec2 {
    return Vec2.speed(this.angle() + angle, this.length());
  }

  normalize(): Vec2 {
    const len = this.length();
    if (Math.abs(len) > EPSILON) {
      return new Vec2(this.x / len, this.y / len);
    } else {
      return new Vec2(0, 0);
    }
  }

  angle(): number {
    return (
      (Math.atan2(this.y, this.x) * RADIAN_TO_DEGREES_COEFICENT + 360) % 360
    );
  }

  distanceTo(other: Vec2): number {
    return this.subtract(other).length();
  }

  angleTo(other: Vec2): number {
    return other.subtract(this).angle();
  }

  dotProduct(other: Vec2): number {
    return this.x * other.x + this.y * other.y;
  }
}
