# ember-night-kitchen-25

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/q514168795/ember-night-kitchen-25/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/q514168795/ember-night-kitchen-25/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Ember Night Kitchen is an original offline cooking game: four recipes, two burners, a prep board and one short, hot dinner shift.

## Play it

```sh
node serve.ts
```

Open http://localhost:8080 in Chrome.

Pick ingredients from the pantry, pin a ticket, chop produce, cook on either burner, plate the components and serve before the bar empties. Correct timing pays a patience bonus; consecutive serves build a combo.

- Mouse: click tickets, crates, the prep board, burners, plate and the serve button.
- Keyboard: Q–I pick ingredients, 1 prep, 2/3 burners, 4 plate, 5 serve.
- Space or Enter performs the context action. P pauses, M mutes, Backspace clears your hands, C clears the plate.

All food, characters, sounds and interfaces are drawn or generated in code. There are no downloaded assets, fonts, libraries or network requests.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The screenshots in `screenshots/` are real headless-Chrome renders of this repository's game. `vendor/makefun-game.ts` is the unmodified make.fun kit library used to build the dossier.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
