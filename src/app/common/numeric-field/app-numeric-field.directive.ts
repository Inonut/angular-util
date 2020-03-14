import {Directive, HostListener, Input} from '@angular/core';
import {KeyCode} from '../enum/key-code';

@Directive({
  selector: '[appNumericField]'
})
export class AppNumericFieldDirective {
  private _minValue: number = -Number.MAX_SAFE_INTEGER;

  get minValue(): number {
    return this._minValue;
  }

  @Input('minValue')
  set minValue(value: number) {
    this._minValue = value;
  }

  private _maxValue: number = Number.MAX_SAFE_INTEGER;

  get maxValue(): number {
    return this._maxValue;
  }

  @Input('maxValue')
  set maxValue(value: number) {
    this._maxValue = value;
  }

  private _maxDecimals = 2;

  get maxDecimals(): number {
    return this._maxDecimals;
  }

  @Input('maxDecimals')
  set maxDecimals(value: number) {
    this._maxDecimals = value;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event) {
    if ([KeyCode.TAB, KeyCode.ESCAPE, KeyCode.ENTER].indexOf(event.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (event.keyCode === KeyCode.UPPERCASE_A && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+C
      (event.keyCode === KeyCode.UPPERCASE_C && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+V
      (event.keyCode === KeyCode.LOWERCASE_V && (event.ctrlKey || event.metaKey)) ||
      // Allow: home, end, left, right
      (event.keyCode >= KeyCode.END && event.keyCode <= KeyCode.RIGHT_ARROW)) {
      // let it happen, don't do anything
      return;
    }

    if ((event.keyCode == KeyCode.PERIOD || event.keyCode == KeyCode.DECIMAL_POINT) && this.maxDecimals < 1) {
      event.preventDefault();
      return;
    }

    const ctrlX = event.keyCode === KeyCode.LOWERCASE_X && (event.ctrlKey || event.metaKey);

    if ([KeyCode.BACKSPACE, KeyCode.DELETE, KeyCode.DECIMAL_POINT, KeyCode.DASH, KeyCode.NUMPAD_DASH, KeyCode.PERIOD].indexOf(event.keyCode) == -1
      && !ctrlX
      && (event.shiftKey || (event.keyCode < KeyCode.DIGIT_0 || event.keyCode > KeyCode.DIGIT_9))
      && (event.keyCode < KeyCode.NUMPAD_0 || event.keyCode > KeyCode.NUMPAD_9)) {
      event.preventDefault();
      return;
    }

    let value = event.target.value;
    const selectionStart = event.target.selectionStart;
    const selectionEnd = event.target.selectionEnd;

    if (event.keyCode == KeyCode.BACKSPACE || event.keyCode == KeyCode.DELETE || ctrlX) { // handle Backspace, Delete and Ctrl+X keys
      if (value != '') {
        if (selectionStart != selectionEnd) {
          value = value.substring(0, selectionStart) + value.substring(selectionEnd);
        } else {
          if (event.keyCode == KeyCode.BACKSPACE) { // Backspace key, remove from right to left
            value = value.substring(0, selectionStart - 1) + value.substring(selectionEnd);
          } else if (event.keyCode == KeyCode.DELETE) { // Delete key, remove from left to right
            if (selectionEnd != value.length) {
              value = value.substring(0, selectionStart) + value.substring(selectionEnd + 1);
            }
          }
        }
      }
    } else {
      value = value.substring(0, selectionStart)
        + event.key
        + value.substring(selectionEnd);
    }

    if (!this.checkFinalValue(value)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event) {
    const data = event.clipboardData.getData('text/plain');
    if (data == '') {
      return;
    }

    let value = event.target.value;
    value = value.substring(0, event.target.selectionStart)
      + data
      + value.substring(event.target.selectionEnd);

    if (!this.checkFinalValue(value)) {
      event.preventDefault();
    }
  }

  private checkFinalValue(value): boolean {
    const dotSplitted = value.split('.');
    if (dotSplitted.length > 0) {
      const firstPart = dotSplitted[0];
      if (dotSplitted.length == 2) {
        const secondPart = dotSplitted[1];
        if (secondPart.length > this._maxDecimals) {
          return false;
        }
      }

      if (firstPart.startsWith('0') && firstPart.length >= 2) {
        return false;
      }
    }

    if (value === '-') {
      return this._minValue < 0;
    }

    let numberValue = Number(value);
    if (value == '.') {
      numberValue = 0;
    }

    return !isNaN(numberValue)
      && numberValue >= this._minValue
      && numberValue <= this._maxValue;
  }

}
