import { Vec2 } from "./vec2";

export class Circle {
  private constructor(
    public readonly position: Vec2,
    public readonly radius: number
  ) {}

  static create(position: Vec2, radius: number): Circle {
    return new Circle(position, radius);
  }

  checkCollisionPoint(point: Vec2): boolean {
    return this.position.distanceTo(point) < this.radius;
  }

  checkCollisionCircle(other: Circle): boolean {
    return (
      this.position.distanceTo(other.position) < this.radius + other.radius
    );
  }
}
