export interface BounceKeysProps {
  // Time window in milliseconds
  bounceWindow: number,
  // Setting to true will only block successive repeat presses, and not
  // block if another key is pressed between repeat presses, even within
  // the bounce window
  repeatOnly?: boolean,
  // List of key codes to ignore bounce behavior on
  // Refer to: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
  ignoredKeyCodes?: Set<string> | string[];
  // Setting to true will emit events from the target element (ex. input)
  // when keypresses are blocked
  shouldEmitBlockEvents?: boolean;
};

export class BounceKeys {
  private readonly bounceWindow: number;
  private readonly repeatOnly: boolean;
  private readonly shouldEmitBlockEvents: boolean;
  private readonly ignoredKeyCodes: Set<string>;

  private debounceMap: Record<string, number> = {};
  private lastPressKeyCode: string;

  public constructor(props: BounceKeysProps) {
    this.bounceWindow = props.bounceWindow;
    this.repeatOnly = !!props.repeatOnly;
    this.shouldEmitBlockEvents = !!props.shouldEmitBlockEvents;
    this.ignoredKeyCodes = new Set(props.ignoredKeyCodes);
  }

  public handleEvent(e: KeyboardEvent) {
    if (!(e instanceof KeyboardEvent)) {
      throw new TypeError("BounceKeys can only be used on listeners that emit KeyboardEvent.");
    }

    const currentPressKeyCode = e.code;
    const currentPressTime = performance.now();

    const timeSinceLastPress = currentPressTime - (this.debounceMap[currentPressKeyCode] ?? Number.MIN_SAFE_INTEGER);

    // Block logic
    if (
      timeSinceLastPress <= this.bounceWindow &&
      !(this.repeatOnly && currentPressKeyCode !== this.lastPressKeyCode) &&
      !(this.ignoredKeyCodes.has(currentPressKeyCode))
    ) {
      e.preventDefault();
      if (this.shouldEmitBlockEvents) {
        e.target.dispatchEvent(new CustomEvent("bounce-keys:blocked", {
          detail: { code: currentPressKeyCode }
        }));
      }
    }

    // Update memory
    this.debounceMap[currentPressKeyCode] = currentPressTime;
    this.lastPressKeyCode = currentPressKeyCode;
  }
}
