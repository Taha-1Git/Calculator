const test = require("node:test");
const assert = require("node:assert/strict");
const Calculator = require("./calculator.js");

// Feed a list of keys like ["1", "+", "2", "="] and return the final state.
function press(keys) {
  const actions = {
    "+": { type: "operator", value: "+" },
    "-": { type: "operator", value: "-" },
    "*": { type: "operator", value: "*" },
    "/": { type: "operator", value: "/" },
    "=": { type: "equals" },
    ".": { type: "decimal" },
    C: { type: "clear" },
    B: { type: "backspace" },
    N: { type: "negate" },
    "%": { type: "percent" },
  };
  return keys.reduce((state, key) => {
    const action = actions[key] || { type: "digit", value: key };
    return Calculator.reduce(state, action);
  }, Calculator.initialState());
}

const show = (keys) => press(keys).display;

test("basic arithmetic", () => {
  assert.equal(show(["1", "2", "+", "3", "="]), "15");
  assert.equal(show(["9", "-", "4", "="]), "5");
  assert.equal(show(["6", "*", "7", "="]), "42");
  assert.equal(show(["8", "/", "2", "="]), "4");
});

test("decimals and floating point noise", () => {
  assert.equal(show(["0", ".", "1", "+", "0", ".", "2", "="]), "0.3");
  assert.equal(show(["1", ".", "5", "*", "2", "="]), "3");
  assert.equal(show([".", "5"]), "0.5");
  assert.equal(show(["1", ".", "2", ".", "3"]), "1.23");
});

test("chained operations evaluate left to right", () => {
  assert.equal(show(["2", "+", "3", "*", "4", "="]), "20");
});

test("changing the operator replaces it", () => {
  assert.equal(show(["5", "+", "-", "2", "="]), "3");
});

test("division by zero shows Error and recovers", () => {
  const s = press(["5", "/", "0", "="]);
  assert.equal(s.display, "Error");
  assert.equal(s.error, true);
  assert.equal(show(["5", "/", "0", "=", "7"]), "7");
});

test("clear resets everything", () => {
  const s = press(["5", "+", "3", "C"]);
  assert.deepEqual(s, Calculator.initialState());
});

test("backspace removes the last digit, never goes empty", () => {
  assert.equal(show(["1", "2", "3", "B"]), "12");
  assert.equal(show(["7", "B"]), "0");
  assert.equal(show(["5", "N", "B"]), "0");
});

test("negate toggles the sign", () => {
  assert.equal(show(["5", "N"]), "-5");
  assert.equal(show(["5", "N", "N"]), "5");
  assert.equal(show(["N"]), "0");
  assert.equal(show(["3", "-", "2", "N", "="]), "5");
});

test("percent divides by 100", () => {
  assert.equal(show(["5", "0", "%"]), "0.5");
});

test("typing after equals starts a new number", () => {
  assert.equal(show(["2", "+", "2", "=", "9"]), "9");
});

test("leading zeros collapse", () => {
  assert.equal(show(["0", "0", "5"]), "5");
});

test("digit limit is enforced", () => {
  const keys = Array(20).fill("1");
  assert.equal(show(keys).length, Calculator.MAX_DIGITS);
});

test("expression line", () => {
  assert.equal(Calculator.expression(press(["1", "2", "/"])), "12 ÷");
  assert.equal(Calculator.expression(press(["1", "2"])), "");
});
