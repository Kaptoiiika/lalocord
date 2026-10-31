export type ClientKeys =
  | 'Escape'
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12'
  | 'ScrollLock'
  | 'Pause'
  | 'Backquote'
  | 'Digit1'
  | 'Digit2'
  | 'Digit3'
  | 'Digit4'
  | 'Digit5'
  | 'Digit6'
  | 'Digit7'
  | 'Digit8'
  | 'Digit9'
  | 'Digit0'
  | 'Minus'
  | 'Equal'
  | 'Backspace'
  | 'Insert'
  | 'Home'
  | 'PageUp'
  | 'NumLock'
  | 'NumpadDivide'
  | 'NumpadMultiply'
  | 'NumpadSubtract'
  | 'Tab'
  | 'KeyQ'
  | 'KeyW'
  | 'KeyE'
  | 'KeyR'
  | 'KeyT'
  | 'KeyY'
  | 'KeyU'
  | 'KeyI'
  | 'KeyO'
  | 'KeyP'
  | 'BracketLeft'
  | 'BracketRight'
  | 'Backslash'
  | 'Delete'
  | 'End'
  | 'PageDown'
  | 'Numpad7'
  | 'Numpad8'
  | 'Numpad9'
  | 'NumpadAdd'
  | 'CapsLock'
  | 'KeyA'
  | 'KeyS'
  | 'KeyD'
  | 'KeyF'
  | 'KeyG'
  | 'KeyH'
  | 'KeyJ'
  | 'KeyK'
  | 'KeyL'
  | 'Semicolon'
  | 'Quote'
  | 'Enter'
  | 'Numpad4'
  | 'Numpad5'
  | 'Numpad6'
  | 'ShiftLeft'
  | 'KeyZ'
  | 'KeyX'
  | 'KeyC'
  | 'KeyV'
  | 'KeyB'
  | 'KeyN'
  | 'KeyM'
  | 'Comma'
  | 'Period'
  | 'Slash'
  | 'ShiftRight'
  | 'ArrowUp'
  | 'Numpad1'
  | 'Numpad2'
  | 'Numpad3'
  | 'NumpadEnter'
  | 'ControlLeft'
  | 'AltLeft'
  | 'ContextMenu'
  | 'ControlRight'
  | 'ArrowLeft'
  | 'ArrowDown'
  | 'ArrowRight'
  | 'Numpad0'
  | 'NumpadDecimal'
  | 'MetaLeft'
  | 'Space'
  | 'AltRight'

const clientKeys: Record<ClientKeys, true> = {
  Escape: true,
  F1: true,
  F2: true,
  F3: true,
  F4: true,
  F5: true,
  F6: true,
  F7: true,
  F8: true,
  F9: true,
  F10: true,
  F11: true,
  F12: true,
  ScrollLock: true,
  Pause: true,
  Backquote: true,
  Digit1: true,
  Digit2: true,
  Digit3: true,
  Digit4: true,
  Digit5: true,
  Digit6: true,
  Digit7: true,
  Digit8: true,
  Digit9: true,
  Digit0: true,
  Minus: true,
  Equal: true,
  Backspace: true,
  Insert: true,
  Home: true,
  PageUp: true,
  NumLock: true,
  NumpadDivide: true,
  NumpadMultiply: true,
  NumpadSubtract: true,
  Tab: true,
  KeyQ: true,
  KeyW: true,
  KeyE: true,
  KeyR: true,
  KeyT: true,
  KeyY: true,
  KeyU: true,
  KeyI: true,
  KeyO: true,
  KeyP: true,
  BracketLeft: true,
  BracketRight: true,
  Backslash: true,
  Delete: true,
  End: true,
  PageDown: true,
  Numpad7: true,
  Numpad8: true,
  Numpad9: true,
  NumpadAdd: true,
  CapsLock: true,
  KeyA: true,
  KeyS: true,
  KeyD: true,
  KeyF: true,
  KeyG: true,
  KeyH: true,
  KeyJ: true,
  KeyK: true,
  KeyL: true,
  Semicolon: true,
  Quote: true,
  Enter: true,
  Numpad4: true,
  Numpad5: true,
  Numpad6: true,
  ShiftLeft: true,
  KeyZ: true,
  KeyX: true,
  KeyC: true,
  KeyV: true,
  KeyB: true,
  KeyN: true,
  KeyM: true,
  Comma: true,
  Period: true,
  Slash: true,
  ShiftRight: true,
  ArrowUp: true,
  Numpad1: true,
  Numpad2: true,
  Numpad3: true,
  NumpadEnter: true,
  ControlLeft: true,
  AltLeft: true,
  ContextMenu: true,
  ControlRight: true,
  ArrowLeft: true,
  ArrowDown: true,
  ArrowRight: true,
  Numpad0: true,
  NumpadDecimal: true,
  MetaLeft: true,
  Space: true,
  AltRight: true,
}

export const isClientKey = (code: string): code is ClientKeys => Object.hasOwn(clientKeys, code)

export type RemoteControlMouseButton = 'left' | 'middle' | 'right'

export type RemoteControlEvent =
  | { type: 'mousemove'; x: number; y: number }
  | { type: 'mousedown'; x: number; y: number; button: RemoteControlMouseButton }
  | { type: 'mouseup'; x: number; y: number; button: RemoteControlMouseButton }
  | { type: 'mousedelta'; dx: number; dy: number }
  | { type: 'mousebutton'; button: RemoteControlMouseButton; pressed: boolean }
  | { type: 'wheel'; dx: number; dy: number }
  | { type: 'keydown'; code: ClientKeys }
  | { type: 'keyup'; code: ClientKeys }
  | { type: 'release' }

const mouseButtons: Record<RemoteControlMouseButton, true> = {
  left: true,
  middle: true,
  right: true,
}

const isRelativePoint = (x: unknown, y: unknown) =>
  typeof x === 'number' && typeof y === 'number' && Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 1 && y >= 0 && y <= 1

const isMouseButton = (button: unknown): button is RemoteControlMouseButton =>
  typeof button === 'string' && Object.hasOwn(mouseButtons, button)

export const isRemoteControlEvent = (value: unknown): value is RemoteControlEvent => {
  if (typeof value !== 'object' || value === null) return false

  const event = value as { type?: unknown }

  if (event.type === 'release') return true

  if (event.type === 'mousemove' || event.type === 'mousedown' || event.type === 'mouseup') {
    const pointEvent = value as { x?: unknown; y?: unknown; button?: unknown }
    if (!isRelativePoint(pointEvent.x, pointEvent.y)) return false
    if (event.type === 'mousemove') return true

    return isMouseButton(pointEvent.button)
  }

  if (event.type === 'mousedelta') {
    const deltaEvent = value as { dx?: unknown; dy?: unknown }

    return (
      typeof deltaEvent.dx === 'number' &&
      typeof deltaEvent.dy === 'number' &&
      Number.isFinite(deltaEvent.dx) &&
      Number.isFinite(deltaEvent.dy)
    )
  }

  if (event.type === 'mousebutton') {
    const buttonEvent = value as { button?: unknown; pressed?: unknown }

    return isMouseButton(buttonEvent.button) && typeof buttonEvent.pressed === 'boolean'
  }

  if (event.type === 'wheel') {
    const wheelEvent = value as { dx?: unknown; dy?: unknown }

    return (
      typeof wheelEvent.dx === 'number' &&
      typeof wheelEvent.dy === 'number' &&
      Number.isFinite(wheelEvent.dx) &&
      Number.isFinite(wheelEvent.dy)
    )
  }

  if (event.type === 'keydown' || event.type === 'keyup') {
    const keyEvent = value as { code?: unknown }

    return typeof keyEvent.code === 'string' && isClientKey(keyEvent.code)
  }

  return false
}
