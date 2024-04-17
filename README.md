# Реализация физики шаров и биндинги для реакта

Физика описана в файле `game.ts` в функциях `moveBallWithHandleOutsideGameBoard` и `handleCollision`

```ts
/// Функция итерации физики
/// (Я убрал input и delta, они не нужны для понимания)
/// (Так как я убрал delta, нужно убрать её и из handleCollision и moveBallWithHandleOutsideGameBoard)
public update() {
    const balls = [...this.gameBoard];

    for (let i = 0; i < balls.length; ++i) {
      for (let j = i + 1; j < balls.length; ++j) {
        this.handleCollision(balls[i], balls[j]);
      }
    }

    for (const ball of balls) {
      this.moveBallWithHandleOutsideGameBoard(ball);
    }
  }
```

## Ссылки

[Репозиторий с кодом](https://github.com/givename/physical-balls-react)

[Основной референс физики](https://www.edopedia.com/blog/make-8-ball-pool-multiplayer-billiards-game-using-javascript/)

[Очень интересный референс](http://tm.spbstu.ru/%D0%9A%D0%9F:_%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%B8%D0%BA%D0%B0_%D0%B1%D0%B8%D0%BB%D1%8C%D1%8F%D1%80%D0%B4%D0%B0)

[Тоже очень интересно](https://www.youtube.com/watch?v=vF4JmvWLlNE)
