import { useEffect, useRef, useState } from "react";
import { Game, GameIOInput } from "./game-billiards/game";
import { drawArrow } from "./canvas-tools";
import { Modal } from "./Modal";

const WIDTH = 800;
const HEIGHT = 600;

const gameRenderIteration = (
  game: Game,
  canvasContext: CanvasRenderingContext2D | null
) => {
  if (!canvasContext) {
    return;
  }

  /// Reset surface
  canvasContext.fillStyle = "white";
  canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

  /// Render balls
  for (const ball of game.gameBoard) {
    canvasContext.fillStyle = ball.color;
    canvasContext.beginPath();
    canvasContext.arc(
      ball.position.x,
      ball.position.y,
      ball.radius,
      0,
      2 * Math.PI
    );
    canvasContext.fill();
  }

  /// Render selected circle
  const hold = game.holding;
  if (hold) {
    canvasContext.strokeStyle = "red";
    canvasContext.beginPath();
    canvasContext.arc(
      hold.ball.position.x,
      hold.ball.position.y,
      hold.ball.radius + 8,
      0,
      2 * Math.PI
    );
    canvasContext.stroke();

    if (hold.mouseOffset) {
      canvasContext.strokeStyle = "green";

      drawArrow(
        canvasContext,
        hold.ball.position.x,
        hold.ball.position.y,
        hold.ball.position.x + hold.mouseOffset.x,
        hold.ball.position.y + hold.mouseOffset.y,
        10
      );

      canvasContext.strokeStyle = "black";

      drawArrow(
        canvasContext,
        hold.mouse.x,
        hold.mouse.y,
        hold.mouse.x + hold.mouseOffset.x,
        hold.mouse.y + hold.mouseOffset.y,
        40
      );
    }
  }
};

export const PseudoBilliards = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unreactiveGame = useRef<Game>(
    null as unknown as Game /** provided by useEffect */
  );

  const [gameReactiveKey, setGameReactiveKey] = useState(Date.now());

  const [openChangeColorModal, setOpenChangeColorModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);

  const [changerBallColor, setChangerBallColor] = useState(() => {
    return (_color: string) => {};
  });

  /// Reactive support
  useEffect(() => {
    unreactiveGame.current = Game.createGame(WIDTH, HEIGHT);

    const remove = unreactiveGame.current.on("clickOnBall", ({ ball }) => {
      setOpenChangeColorModal(true);

      setChangerBallColor(() => {
        return (color: string) => {
          ball.color = color;
        };
      });
    });

    return () => remove();
  }, [gameReactiveKey]);

  /// Loop
  useEffect(() => {
    const canvas = canvasRef.current!;

    const ioinput: GameIOInput = {
      mousex: 0,
      mousey: 0,
      click: "none",
    };

    const trackingMousePosition = (event: MouseEvent) => {
      ioinput.mousex = event.clientX - canvas.offsetLeft;
      ioinput.mousey = event.clientY - canvas.offsetTop;
    };

    const trackingMousePressed = (event: MouseEvent) => {
      if (event.button === 0) {
        ioinput.click = "pressed";
      }
    };

    const trackingMouseReleased = (event: MouseEvent) => {
      if (event.button === 0) {
        ioinput.click = "released";
      }
    };

    canvas.addEventListener("mousemove", trackingMousePosition);
    canvas.addEventListener("mousedown", trackingMousePressed);
    canvas.addEventListener("mouseup", trackingMouseReleased);

    const interval = setInterval(() => {
      unreactiveGame.current.update(ioinput, 1);

      if (ioinput.click === "pressed") {
        ioinput.click = "hold";
      } else if (ioinput.click === "released") {
        ioinput.click = "none";
      }
    }, 1000 / 60);

    return () => {
      clearInterval(interval);

      canvas.removeEventListener("mousemove", trackingMousePosition);
      canvas.removeEventListener("mouseup", trackingMouseReleased);
      canvas.removeEventListener("mousedown", trackingMousePressed);
    };
  }, [changerBallColor /** нужно для корректного слежения за мышью */]);

  /// Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas!.getContext("2d");

    const interval = setInterval(() => {
      gameRenderIteration(unreactiveGame.current, context);
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, []);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    changerBallColor(color);
  };

  const closeModal = () => {
    setOpenChangeColorModal(false);
    setChangerBallColor(() => {});
  };

  return (
    <>
      <Modal isOpen={openChangeColorModal} onClose={closeModal}>
        <div
          style={{
            width: 300,
            height: 300,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h2>Выберите цвет</h2>
          <input type="color" onChange={handleColorChange} />
          <button onClick={closeModal}>Закрыть</button>
        </div>
      </Modal>
      <Modal isOpen={openInfoModal} onClose={() => setOpenInfoModal(false)}>
        <h2>
          <a
            target="_blank"
            href="https://github.com/givename/physical-balls-react"
          >
            <u>Github</u>
          </a>
        </h2>
        <h2>
          <a
            target="_blank"
            href="https://www.edopedia.com/blog/make-8-ball-pool-multiplayer-billiards-game-using-javascript/"
          >
            <u>Main reference</u>
          </a>
        </h2>
        <h2>
          <a
            target="_blank"
            href="http://tm.spbstu.ru/%D0%9A%D0%9F:_%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%B8%D0%BA%D0%B0_%D0%B1%D0%B8%D0%BB%D1%8C%D1%8F%D1%80%D0%B4%D0%B0"
          >
            <u>Other</u>
          </a>
        </h2>
        <h2>
          <a target="_blank" href="https://www.youtube.com/watch?v=vF4JmvWLlNE">
            <u>Other</u>
          </a>
        </h2>
      </Modal>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <button
          style={{
            display: "inline-block",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
          }}
          onClick={() => setGameReactiveKey(Date.now())}
        >
          New
        </button>
        <button
          style={{
            display: "inline-block",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
          }}
          onClick={() => setOpenInfoModal(true)}
        >
          Info
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          width: WIDTH,
          height: HEIGHT,
        }}
      />
    </>
  );
};
