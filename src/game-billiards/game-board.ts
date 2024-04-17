import { Vec2 } from "./vec2";
import { Circle } from "./circle";

class InternalPhysicalBall {
  public readonly id = InternalPhysicalBall.counterId++;

  public color: string;
  public position: Vec2;
  public radius: number;
  public speed = Vec2.zero;

  private gameBoard: GameBoard;

  constructor(circle: Circle, color: string, gameBoard: GameBoard) {
    this.color = color;
    this.position = circle.position;
    this.radius = circle.radius;

    this.gameBoard = gameBoard;
  }

  private static counterId = 0;

  toCircle(): Circle {
    return Circle.create(this.position, this.radius);
  }

  isOnGame(): boolean {
    return this.gameBoard.findBallById(this.id) !== null;
  }

  checkOutsideGameBoard(
    position = this.position
  ): "left" | "right" | "top" | "bottom" | null {
    if (position.x - this.radius < 0) {
      return "left";
    }
    if (position.x + this.radius >= this.gameBoard.width) {
      return "right";
    }
    if (position.y - this.radius < 0) {
      return "top";
    }
    if (position.y + this.radius >= this.gameBoard.height) {
      return "bottom";
    }
    return null;
  }

  checkCollisionBall(position = this.position): null | PhysicalBall {
    const circle = Circle.create(position, this.radius);

    for (const ball of this.gameBoard) {
      if (ball.id === this.id) {
        continue;
      }
      if (ball.toCircle().checkCollisionCircle(circle)) {
        return ball;
      }
    }
    return null;
  }
}

export type PhysicalBall = InternalPhysicalBall;

export class GameBoard {
  private balls: Map<number, InternalPhysicalBall> = new Map();

  constructor(public readonly width: number, public readonly height: number) {}

  findFirstCollisionByPoint(point: Vec2): null | InternalPhysicalBall {
    for (const ball of this.balls.values()) {
      if (ball.toCircle().checkCollisionPoint(point)) {
        return ball;
      }
    }
    return null;
  }

  findFirstCollisionByCircle(other: Circle): null | InternalPhysicalBall {
    for (const ball of this.balls.values()) {
      if (ball.toCircle().checkCollisionCircle(other)) {
        return ball;
      }
    }
    return null;
  }

  findFirstCollisionByBall(
    other: InternalPhysicalBall
  ): null | InternalPhysicalBall {
    for (const ball of this.balls.values()) {
      if (ball.id === other.id) {
        continue;
      }
      if (ball.toCircle().checkCollisionCircle(other.toCircle())) {
        return ball;
      }
    }
    return null;
  }

  findBallById(id: number): null | InternalPhysicalBall {
    return this.balls.get(id) ?? null;
  }

  createBall(circle: Circle, color: string): InternalPhysicalBall {
    const ball = new InternalPhysicalBall(circle, color, this);
    this.balls.set(ball.id, ball);
    return ball;
  }

  removeBall(ball: InternalPhysicalBall) {
    this.balls.delete(ball.id);
  }

  [Symbol.iterator](): IterableIterator<InternalPhysicalBall> {
    return this.balls.values();
  }
}
