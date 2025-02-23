export interface BounceTypeProps {
  // Time window in milliseconds
  bounceWindow: number,
  // Setting to true will only block successive repeat presses, and not
  // block if another key is pressed between repeat presses, even within
  // the bounce window
  repeatOnly?: boolean,
  // List of key codes to ignore bounce behavior on
  // Refer to: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
  ignoredKeyCodes?: Set<string> | string[];
};

export class BounceType {
  private readonly bounceWindow: number;
  private readonly repeatOnly: boolean;
  private readonly ignoredKeyCodes: Set<string>;

  private debounceMap: Record<string, number> = {};
  private lastPressKeyCode: string;

  public constructor(props: BounceTypeProps) {
    this.bounceWindow = props.bounceWindow;
    this.repeatOnly = !!props.repeatOnly;
    this.ignoredKeyCodes = new Set(props.ignoredKeyCodes);
  }

  public handleEvent(e: KeyboardEvent) {
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
    }

    // Update memory
    this.debounceMap[currentPressKeyCode] = currentPressTime;
    this.lastPressKeyCode = currentPressKeyCode;
  }
}
