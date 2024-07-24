import 'guacamole-common-js';

declare module 'guacamole-common-js' {
  namespace Mouse {
    interface Touchscreen {
      onmousedown?: (state: Mouse.State) => void;
      onmouseup?: (state: Mouse.State) => void;
      onmousemove?: (state: Mouse.State) => void;
    }
  }
  interface Mouse {
    onmousedown?: (state: Mouse.State) => void;
    onmouseup?: (state: Mouse.State) => void;
    onmousemove?: (state: Mouse.State) => void;
  }

  interface Touch {
    ontouchstart?: (state: Touch.State) => void;
    ontouchend?: (state: Touch.State) => void;
    ontouchmove?: (state: Touch.State) => void;
  }
}
