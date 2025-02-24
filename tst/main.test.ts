import assert from "assert";
import MiniSpec from "minispec";
import { describe, it } from "minispec";
import { JSDOM } from "jsdom";

import { BounceKeys } from "../src/main";

function testEnvWithInput() {
  const dom = new JSDOM("<input type='text'/>");
  global.KeyboardEvent = dom.window.KeyboardEvent;
  return {
    dom: dom,
    window: dom.window,
    document: dom.window.document
  };
}

function keydownEvent(window, code: string) {
  return new window.KeyboardEvent("keydown", {"code": code, cancelable: true})
}

describe("Basic usage, without optional props", async () => {
  it("prevents successive repeats", async () => {
    // Setup
    const underTest = new BounceKeys({ bounceWindow: 10000 });
    const { window, document } = testEnvWithInput();
    const inputEl = document.querySelector("input");
    inputEl.addEventListener("keydown", underTest);

    // Execution
    const keyPress1 = keydownEvent(window, "KeyA");
    const keyPress2 = keydownEvent(window, "KeyA");
    const keyPress3 = keydownEvent(window, "KeyA");
    inputEl.dispatchEvent(keyPress1);
    inputEl.dispatchEvent(keyPress2);
    inputEl.dispatchEvent(keyPress3);

    // Assertion
    assert.equal(keyPress1.defaultPrevented, false);
    assert.equal(keyPress2.defaultPrevented, true);
    assert.equal(keyPress3.defaultPrevented, true);
  });

  it("lets through delayed repeats", async () => {
    // Setup
    const underTest = new BounceKeys({ bounceWindow: 100 });
    const { window, document } = testEnvWithInput();
    const inputEl = document.querySelector("input");
    inputEl.addEventListener("keydown", underTest);

    // Execution
    const keyPress1 = keydownEvent(window, "KeyA");
    const keyPress2 = keydownEvent(window, "KeyA");
    inputEl.dispatchEvent(keyPress1);
    setTimeout(() => {
      inputEl.dispatchEvent(keyPress2)
    }, 1000);

    // Assertions
    setTimeout(() => {
      assert.equal(keyPress1.defaultPrevented, false);
      assert.equal(keyPress2.defaultPrevented, false);
    }, 2000);
  });
});

describe("With repeatOnly enabled", async () => {
  it("lets through interleaved repeats", async () => {
    // Setup
    const underTest = new BounceKeys({bounceWindow: 1000, repeatOnly: true});
    const { window, document } = testEnvWithInput();
    const inputEl = document.querySelector("input");
    inputEl.addEventListener("keydown", underTest);

    // Execution
    const keyPress1 = keydownEvent(window, "KeyA");
    const keyPress2 = keydownEvent(window, "KeyB");
    const keyPress3 = keydownEvent(window, "KeyA");
    inputEl.dispatchEvent(keyPress1);
    inputEl.dispatchEvent(keyPress2);
    inputEl.dispatchEvent(keyPress3);

    // Assertion
    assert.equal(keyPress1.defaultPrevented, false);
    assert.equal(keyPress2.defaultPrevented, false);
    assert.equal(keyPress3.defaultPrevented, false);
  });

  it("still prevents successive repeats", async () => {
    // Setup
    const underTest = new BounceKeys({bounceWindow: 1000, repeatOnly: true});
    const { window, document } = testEnvWithInput();
    const inputEl = document.querySelector("input");
    inputEl.addEventListener("keydown", underTest);

    // Execution
    const keyPress1 = keydownEvent(window, "KeyA");
    const keyPress2 = keydownEvent(window, "KeyA");
    const keyPress3 = keydownEvent(window, "KeyB");
    const keyPress4 = keydownEvent(window, "KeyA");
    inputEl.dispatchEvent(keyPress1);
    inputEl.dispatchEvent(keyPress2);
    inputEl.dispatchEvent(keyPress3);
    inputEl.dispatchEvent(keyPress4);

    // Assertion
    assert.equal(keyPress1.defaultPrevented, false);
    assert.equal(keyPress2.defaultPrevented, true);
    assert.equal(keyPress3.defaultPrevented, false);
    assert.equal(keyPress4.defaultPrevented, false);
  });

  it("still prevents delayed repeats", async () => {
    // Setup
    const underTest = new BounceKeys({ bounceWindow: 100 });
    const { window, document } = testEnvWithInput();
    const inputEl = document.querySelector("input");
    inputEl.addEventListener("keydown", underTest);

    // Execution
    const keyPress1 = keydownEvent(window, "KeyA");
    const keyPress2 = keydownEvent(window, "KeyA");
    inputEl.dispatchEvent(keyPress1);
    setTimeout(() => {
      inputEl.dispatchEvent(keyPress2)
    }, 1000);

    // Assertions
    setTimeout(() => {
      assert.equal(keyPress1.defaultPrevented, false);
      assert.equal(keyPress2.defaultPrevented, false);
    }, 2000);
  });
});

describe("With key codes ignored", async () => {
  it("lets through repeats of ignored keys", async () => {
    // Setup
    const underTest = new BounceKeys({bounceWindow: 1000, ignoredKeyCodes: ["Backspace"]});
    const { window, document } = testEnvWithInput();
    const inputEl = document.querySelector("input");
    inputEl.addEventListener("keydown", underTest);

    // Execution
    const keyPress1 = keydownEvent(window, "Backspace");
    const keyPress2 = keydownEvent(window, "Backspace");
    inputEl.dispatchEvent(keyPress1);
    inputEl.dispatchEvent(keyPress2);

    // Assertion
    assert.equal(keyPress1.defaultPrevented, false);
    assert.equal(keyPress2.defaultPrevented, false);
  });

  it("still prevents successive repeats of other keys", async () => {
    // Setup
    const underTest = new BounceKeys({bounceWindow: 1000, ignoredKeyCodes: ["Backspace"]});
    const { window, document } = testEnvWithInput();
    const inputEl = document.querySelector("input");
    inputEl.addEventListener("keydown", underTest);

    // Execution
    const keyPress1 = keydownEvent(window, "KeyA");
    const keyPress2 = keydownEvent(window, "KeyA");
    const keyPress3 = keydownEvent(window, "Backspace");
    const keyPress4 = keydownEvent(window, "Backspace");
    inputEl.dispatchEvent(keyPress1);
    inputEl.dispatchEvent(keyPress2);
    inputEl.dispatchEvent(keyPress3);
    inputEl.dispatchEvent(keyPress4);

    // Assertion
    assert.equal(keyPress1.defaultPrevented, false);
    assert.equal(keyPress2.defaultPrevented, true);
    assert.equal(keyPress3.defaultPrevented, false);
    assert.equal(keyPress4.defaultPrevented, false);
  });
});

MiniSpec.execute();
