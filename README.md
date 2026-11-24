# Simple Calculator

A small calculator built with plain HTML, CSS and JavaScript. No frameworks, no build step.

## Features

- Add, subtract, multiply, divide (chained operations evaluate left to right)
- Decimals, percent, sign toggle, backspace, all-clear
- Divide-by-zero shows `Error` and recovers on the next key
- Floating-point noise is cleaned up (`0.1 + 0.2` shows `0.3`)
- Full keyboard support: digits, `+ - * /`, `Enter` / `=`, `Backspace`, `Esc`, `%`
- 12-digit display limit

## Run it

Open `index.html` in a browser. To host it free, enable GitHub Pages
(Settings → Pages → deploy from `main`, root folder).

## Tests

The calculator logic lives in `calculator.js` as pure functions, separate from the DOM code in `app.js`, so it can be tested directly with Node's built-in runner (Node 18+):

```bash
npm test
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page layout and buttons |
| `style.css` | Styling |
| `calculator.js` | Calculator logic (state + reducer) |
| `app.js` | Wires buttons and keyboard to the logic |
| `test.js` | Unit tests |

## License

MIT

---

Author: **Muhammad Taha** ([@Taha-1Git](https://github.com/Taha-1Git))
