import { Circle } from "./circle";
import { GameBoard, PhysicalBall } from "./game-board";
import { Vec2 } from "./vec2";

import { choose } from "./tools";
import { EventEmitter } from "../event-emitter";

const FRICTION_ON_MOVE = 0.995;
const FRICTION_ON_COLLISION = 0.97;
const FLOAT_ACCURACY = 0.01;
const PHYSIC_ITERATIONS = 4;

export type GameIOInput = {
  mousex: number;
  mousey: number;
  click: "none" | "pressed" | "hold" | "released";
};

export class Game {
  private constructor(public readonly gameBoard: GameBoard) {}

  private mouseHoldingBall: PhysicalBall | null = null;
  private mouseHoldingBallMousePosition: Vec2 | null = null;
  private mouseHoldingBallMouseOffset: Vec2 | null = null;

  private emitter = new EventEmitter<{
    clickOnBall: {
      ball: PhysicalBall;
      mousePressed: Vec2;
      mouseReleased: Vec2;
    };
  }>();

  get holding() {
    if (!this.mouseHoldingBall) {
      return null;
    }

    return {
      ball: this.mouseHoldingBall!,
      mouse: this.mouseHoldingBallMousePosition!,
      mouseOffset: this.mouseHoldingBallMouseOffset,
    };
  }

  static createGame(width: number, height: number): Game {
    const gameBoard = new GameBoard(width, height);
    const game = new Game(gameBoard);

    game.init();

    return game;
  }

  private init() {
    let randomCount = Math.trunc(Math.random() * 4 + 3);
    for (; randomCount > 0; --randomCount) {
      const radius = Math.trunc(Math.random() * 32 + 32);
      const color = choose(
        "black",
        "blue",
        "red",
        "green",
        "yellow",
        "orange",
        "purple"
      );

      let position: Vec2;
      let circle: Circle;

      do {
        position = Vec2.create(
          radius + Math.random() * (this.gameBoard.width - radius * 2),
          radius + Math.random() * (this.gameBoard.height - radius * 2)
        );
        circle = Circle.create(position, radius);
      } while (this.gameBoard.findFirstCollisionByCircle(circle));

      const ball = this.gameBoard.createBall(circle, color);

      ball.speed = Vec2.speed(Math.random() * 360, 2 + Math.random() * 12);
    }
  }

  public update(input: GameIOInput, delta: number) {
    const balls = [...this.gameBoard];
    const mousepos = Vec2.create(input.mousex, input.mousey);

    if (input.click === "pressed") {
      this.mouseHoldingBall =
        this.gameBoard.findFirstCollisionByPoint(mousepos);

      if (this.mouseHoldingBall) {
        this.mouseHoldingBallMousePosition = mousepos;
        this.mouseHoldingBall.position.subtract(mousepos);
      }
    } else if (this.mouseHoldingBall && this.mouseHoldingBallMousePosition) {
      if (input.click === "hold") {
        const offsetByOriginalPosition = mousepos.subtract(
          this.mouseHoldingBallMousePosition
        );

        if (offsetByOriginalPosition.length() > 2) {
          this.mouseHoldingBallMouseOffset = offsetByOriginalPosition;
        } else {
          this.mouseHoldingBallMouseOffset = null;
        }
      } else if (input.click) {
        if (this.mouseHoldingBallMouseOffset) {
          this.mouseHoldingBall.speed = this.mouseHoldingBall.speed
            .add(this.mouseHoldingBallMouseOffset)
            .multiply(0.4);
        } else {
          this.emitter.emit("clickOnBall", {
            ball: this.mouseHoldingBall,
            mousePressed: this.mouseHoldingBallMousePosition!,
            mouseReleased: mousepos,
          });
        }

        this.mouseHoldingBall = null;
        this.mouseHoldingBallMousePosition = null;
        this.mouseHoldingBallMouseOffset = null;
      }
    }

    for (let t = PHYSIC_ITERATIONS; t > 0; --t) {
      for (let i = 0; i < balls.length; ++i) {
        for (let j = i + 1; j < balls.length; ++j) {
          this.handleCollision(balls[i], balls[j], delta / PHYSIC_ITERATIONS);
        }
      }

      for (const ball of balls) {
        this.moveBallWithHandleOutsideGameBoard(
          ball,
          delta / PHYSIC_ITERATIONS
        );
      }
    }
  }

  private moveBallWithHandleOutsideGameBoard(
    ball: PhysicalBall,
    delta: number
  ) {
    const basicPosition = ball.position;
    const basicSpeed = ball.speed.multiply(delta);

    const newPos = basicPosition.add(basicSpeed);

    const isOutsideGameBoard = ball.checkOutsideGameBoard(newPos);
    if (isOutsideGameBoard) {
      let iterationSpeed = basicSpeed.multiply(FRICTION_ON_MOVE);
      let iterationPosition = basicPosition.add(iterationSpeed);
      let bounceSpeed: Vec2;

      while (
        ball.checkOutsideGameBoard(iterationPosition) &&
        iterationSpeed.length() > FLOAT_ACCURACY
      ) {
        iterationSpeed = iterationSpeed.multiply(FRICTION_ON_MOVE);
        iterationPosition = basicPosition.add(iterationSpeed);
      }

      if (isOutsideGameBoard === "left" || isOutsideGameBoard === "right") {
        bounceSpeed = Vec2.create(-1, 1);
      } else {
        bounceSpeed = Vec2.create(1, -1);
      }

      ball.position = iterationPosition;
      ball.speed = basicSpeed
        .multiply(bounceSpeed)
        .multiply(FRICTION_ON_COLLISION);
    } else {
      ball.position = newPos;
      ball.speed = basicSpeed.multiply(FRICTION_ON_MOVE);
    }

    ball.speed = ball.speed.multiply(1 / delta);
  }

  private handleCollision(
    ball1: PhysicalBall,
    ball2: PhysicalBall,
    delta: number
  ) {
    const basicPosition1 = ball1.position;
    const basicPosition2 = ball2.position;
    const basicSpeed1 = ball1.speed.multiply(delta);
    const basicSpeed2 = ball2.speed.multiply(delta);

    const ball1NewPos = basicPosition1.add(basicSpeed1);
    const ball2NewPos = basicPosition2.add(basicSpeed2);

    const distance = ball1NewPos.distanceTo(ball2NewPos);
    const rotation = ball1NewPos.angleTo(ball2NewPos);

    if (distance > ball1.radius + ball2.radius) {
      return;
    }

    const componentsSum =
      Math.abs(basicSpeed1.x) +
      Math.abs(basicSpeed1.y) +
      Math.abs(basicSpeed2.x) +
      Math.abs(basicSpeed2.y);

    /**
     * Как я понял идея в том, что мы некоторым образом считаем `энергию` (силу столкновения)
     * Затем полученную силу добавляем к скорости каждого мяча
     *
     * Вариантов как можно посчитать силу удара можно придумать множество
     * Я просто взял оригинальный способ, и затюнил так, чтобы было приятно (речь сейчас про 0.12)
     */

    const power = componentsSum * 0.12;

    const speedBounceNew1 = Vec2.speed(rotation + 180, power);
    const speedBounceNew2 = Vec2.speed(rotation, power);

    ball1.speed = basicSpeed1
      .add(speedBounceNew1)
      .multiply(FRICTION_ON_COLLISION)
      .multiply(1 / delta);
    ball2.speed = basicSpeed2
      .add(speedBounceNew2)
      .multiply(FRICTION_ON_COLLISION)
      .multiply(1 / delta);
  }

  public on(...args: Parameters<(typeof this.emitter)["on"]>) {
    return this.emitter.on(...args);
  }

  public remove(...args: Parameters<(typeof this.emitter)["remove"]>) {
    return this.emitter.remove(...args);
  }
}
