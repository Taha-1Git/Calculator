/*
 * Calculator logic — pure functions, no DOM.
 * Works in the browser (window.Calculator) and in Node (require).
 *
 * State shape:
 *   display   string   what the screen shows
 *   previous  number   left operand waiting for an operator (or null)
 *   operator  string   "+", "-", "*", "/" (or null)
 *   overwrite boolean  next digit starts a new number instead of appending
 *   error     boolean  last operation failed (e.g. divide by zero)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Calculator = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var MAX_DIGITS = 12;
  var SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  function initialState() {
    return {
      display: "0",
      previous: null,
      operator: null,
      overwrite: true,
      error: false,
    };
  }

  function errorState() {
    return {
      display: "Error",
      previous: null,
      operator: null,
      overwrite: true,
      error: true,
    };
  }

  // Returns a number, or null if the result is not a finite number.
  function compute(a, op, b) {
    var result;
    switch (op) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "*": result = a * b; break;
      case "/": result = a / b; break;
      default: return null;
    }
    return Number.isFinite(result) ? result : null;
  }

  // Trim floating point noise: 0.1 + 0.2 -> "0.3"
  function format(n) {
    return String(parseFloat(n.toPrecision(MAX_DIGITS)));
  }

  function digitCount(text) {
    return text.replace(/[-.]/g, "").length;
  }

  function reduce(state, action) {
    // After an error, any key starts from a clean slate.
    if (state.error) state = initialState();

    var current = parseFloat(state.display);

    switch (action.type) {
      case "digit": {
        if (state.overwrite || state.display === "0") {
          return Object.assign({}, state, { display: action.value, overwrite: false });
        }
        if (digitCount(state.display) >= MAX_DIGITS) return state;
        return Object.assign({}, state, { display: state.display + action.value });
      }

      case "decimal": {
        if (state.overwrite) {
          return Object.assign({}, state, { display: "0.", overwrite: false });
        }
        if (state.display.indexOf(".") !== -1) return state;
        return Object.assign({}, state, { display: state.display + "." });
      }

      case "operator": {
        // Chain: 2 + 3 * -> evaluate 2 + 3 first.
        if (state.operator && !state.overwrite) {
          var result = compute(state.previous, state.operator, current);
          if (result === null) return errorState();
          return {
            display: format(result),
            previous: result,
            operator: action.value,
            overwrite: true,
            error: false,
          };
        }
        // Changing your mind about the operator just swaps it.
        if (state.operator) {
          return Object.assign({}, state, { operator: action.value });
        }
        return Object.assign({}, state, {
          previous: current,
          operator: action.value,
          overwrite: true,
        });
      }

      case "equals": {
        if (!state.operator) return state;
        var total = compute(state.previous, state.operator, current);
        if (total === null) return errorState();
        return {
          display: format(total),
          previous: null,
          operator: null,
          overwrite: true,
          error: false,
        };
      }

      case "clear":
        return initialState();

      case "backspace": {
        if (state.overwrite) return state;
        var shorter = state.display.slice(0, -1);
        if (shorter === "" || shorter === "-") shorter = "0";
        return Object.assign({}, state, { display: shorter });
      }

      case "negate": {
        if (current === 0 && state.display.indexOf(".") === -1) return state;
        var flipped = state.display.charAt(0) === "-"
          ? state.display.slice(1)
          : "-" + state.display;
        return Object.assign({}, state, { display: flipped });
      }

      case "percent": {
        return Object.assign({}, state, {
          display: format(current / 100),
          overwrite: true,
        });
      }

      default:
        return state;
    }
  }

  // The small line above the display, e.g. "12 ÷"
  function expression(state) {
    if (state.previous === null || !state.operator) return "";
    return format(state.previous) + " " + SYMBOLS[state.operator];
  }

  return {
    initialState: initialState,
    reduce: reduce,
    expression: expression,
    format: format,
    MAX_DIGITS: MAX_DIGITS,
  };
});
