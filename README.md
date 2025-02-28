# bounce-keys

A JavaScript/TypeScript implementation of the Bounce Keys accessibility feature (see [Wikipedia](https://en.wikipedia.org/wiki/Bounce_keys)).

Inspired by the OS-level accessibility feature called Bounce Keys in [GNOME](https://help.gnome.org/users/gnome-help/stable/a11y-bouncekeys.html.en) and [Chrome OS](https://support.google.com/chromebook/thread/326546566), and FilterKeys on [Windows](https://support.microsoft.com/en-us/topic/using-the-shortcut-key-to-enable-filterkeys-d9202e14-4ce5-84ed-582b-68ea1538fa59), this is a platform-agnostic implementation for the web.

**bounce-keys is headless. It's unopinionated about design, and does not affect your design visually.**

## Use Cases

bounce-keys is primarily designed for developers who:
- manage a website or application that runs on web standards (ex. Electron app)
- are aware that a significant portion of their user base have impaired motor skills and would benefit from debounced key presses when entering text.

What bounce-keys *can* do, on a technical level:
- Debounce keyboard input on any DOM element in your website or application that you can attach a `keydown` event listener to.
- Accept configuration - bounce window (milliseconds, provided or configured in your application), whether interleaving keys interrupts debounce, and an ignore list of key codes.
- Be initialized multiple times to be used on different DOM elements, if your design benefits from this somehow.
- Optionally, emit events on block, if your application can benefit from them.

What bounce-keys *cannot* or *does not* do:
- Decorate your UI visually in any way, including any indicators to the user that debounce is active.
- Accept user preferences of any sort, such as allowing the end user to configure bounce window. This is best handled by your application and supplied to this library.

## Usage

### Import

If importing into a package built using Node, first import like this.

```
const { BounceKeys } = require("bounce-keys");  // From a CommonJS project
import { BounceKeys } from "bounce-keys";  // From an ES Modules project
```

### Vanilla JS/TS

See `docs/` for a basic demo of a vanilla JS implementation.

**JavaScript**
```
// Can vary based on your development environment
import { BounceKeys } from "bounce-keys";

const bk = new BounceKeys({ bounceWindow: 750, repeatOnly: true });
const el = document.querySelector("input#my-text-box");

// keydown preferred, but any event that fires KeyboardEvent should work
el.addEventListener("keydown", bk);
```

**HTML**
```
<input type="text" id="my-text-box"/>
```

### Svelte

bounce-keys does not have idiomatic support for Svelte, but can be used via the `use` directive. Here's an example of basic usage on a single `input`, in TypeScript.

```
<script lang="ts">
  import { BounceKeys } from "bounce-keys";

	const bk = new BounceKeys({ bounceWindow: 750, repeatOnly: true });
	function enableBounceKeys(inputEl: HTMLElement) {  // HTMLElement type only required in TypeScript
		inputEl.addEventListener("keydown", bk);
	}
</script>

<input type="text" use:enableBounceKeys/>
```

### React

bounce-keys does not have idiomatic support for React, but can be used via refs. Here's an example of basic usage on a single `input`.

```
import { BounceKeys } from "bounce-keys"
import { useRef } from "react";

function MyComponent() {
  const bk = new BounceKeys({ bounceWindow: 750, repeatOnly: true });

  const inputRef = useRef(null);
  if (inputRef.current) {
    inputRef.current.addEventListener("keydown", bk);
  }

  return (
    <div className="my-component">
      <input type="text" ref={inputRef}/>
    </div>
  );
}
```

### Block Events

Optionally, you can ask bounce-keys to emit events when keys are blocked, in case this is helpful to your application. One use would be to play custom audio cues.

Listen for the `"bounce-keys:blocked"` event on your input element. In vanilla JS/TS, this would look like:

```
const bk = new BounceKeys({ bounceWindow: 750, shouldEmitBlockEvents: true });
const el = document.querySelector("input#my-text-box");
el.addEventListener("keydown", bk);
el.addEventListener("bounce-keys:blocked", event => { doWhatYouWant(event); });
```

The event contains info about which keypress was blocked. Read it by accessing `event.detail.code`. Values will be string values of the `code` attribute in `KeyboardEvent`s dispatched by the user's input.

### Parameters

bounce-keys supports up to four props, one of which is required.

| Prop | Type | Documentation |
|---|---|---|
| `bounceWindow` | `number` | Time window in milliseconds to run the bounce check in. For ex. if set to 1000, the same key won't register if it was pressed in the last 1 second. The window is reset on each press. |
| `repeatOnly` | `boolean` (optional) | If `true`, only successive repeats are blocked. For ex. typing "aaaaa" successively will register only one press, but typing "ababa" will register five times. |
| `shouldEmitBlockEvents` | `boolean` (optional) | If `true`, emits a custom event `"bounce-keys:blocked"` when a key press is blocked. Useful for adding custom behavior like audio cues. |
| `ignoredKeyCodes` | `string[] \| Set<string>` (optional) | Array or set of key code strings that this library will ignore in its block logic. bounce-type relies on the `code` property of `KeyboardEvent`s. [See on MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code). |


## Development

### Quickstart

```
npm run build
```

to compile TypeScript to a dist/ directory.

```
npm run test
```

to run unit tests.

### The Cycle

You can test your changes either by updating tests, or by editing and playing around in the docs/index.htm demo page. If contributing a change, please do both.

Because of module imports, the page works best if you use a simple HTTP server (not included here) to host it on localhost. If you have Python installed, run this in the top level of this repo.

```
python3 -m http.server 8000
```

Then, open http://localhost:8000/docs in a browser. There is no auto-reload.

**Any changes to the HTML** require a browser refresh.

**Any changes to bounce-type itself** require a rebuild of the package and a refresh.

If changes involving imports are to be tested, a local copy of this repo can be installed in another local npm repo using `npm install /path/to/bounce-keys.js` in that repo. Ensure the path points to this repo's top level, where package.json is located.
