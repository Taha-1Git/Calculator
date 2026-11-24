(function () {
  var state = Calculator.initialState();
  var displayEl = document.getElementById("display");
  var expressionEl = document.getElementById("expression");

  function render() {
    displayEl.textContent = state.display;
    expressionEl.textContent = Calculator.expression(state);
    // Shrink long numbers so they always fit the screen.
    var len = state.display.length;
    displayEl.style.fontSize = len > 11 ? "1.6rem" : len > 8 ? "2.2rem" : "";
  }

  function dispatch(action) {
    state = Calculator.reduce(state, action);
    render();
  }

  // Mouse / touch
  document.querySelector(".keys").addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    dispatch({ type: btn.dataset.type, value: btn.dataset.value });
  });

  // Keyboard
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    var key = e.key;
    var action = null;

    if (key >= "0" && key <= "9" && key.length === 1) {
      action = { type: "digit", value: key };
    } else if (key === ".") {
      action = { type: "decimal" };
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
      action = { type: "operator", value: key };
    } else if (key === "Enter" || key === "=") {
      action = { type: "equals" };
    } else if (key === "Backspace") {
      action = { type: "backspace" };
    } else if (key === "Escape" || key === "Delete") {
      action = { type: "clear" };
    } else if (key === "%") {
      action = { type: "percent" };
    }

    if (action) {
      e.preventDefault(); // stops "/" quick-find and double-firing focused buttons
      dispatch(action);
    }
  });

  render();
})();
