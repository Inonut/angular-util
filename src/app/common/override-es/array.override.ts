import {removeIf} from '../utilities';

declare global {
  interface Array<T> {
    removeIf(callback: (el: T, index: number) => boolean): Array<T>;
  }
}

Array.prototype.removeIf = function(callback) {
  removeIf(this, callback);

  return this;
};
