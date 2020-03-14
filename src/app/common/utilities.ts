export function areJsonObjectsEqual(json1: any, json2: any): boolean {
  if (json1 == null) {
    return json2 == null;
  } else {
    if (json2 == null) {
      return false;
    } else {
      return JSON.stringify(json1).trim().localeCompare(JSON.stringify(json2).trim()) == 0;
    }
  }
}

export function timestamp(date?: Date): number {
  const now = new Date();
  return (date || now).getTime() - now.getTimezoneOffset() * 60 * 1000;
}

export function removeNull(json: any): any {
  return [Object.keys(json)
    .filter(key => json[key] == null || json[key] == undefined)
    .forEach(key => delete json[key]), json][1];
}

export function stringify(json: any, trim?: boolean): any {
  if (json == null) {
    return null;
  }
  return JSON.parse(JSON.stringify(json, (key, value) => {
    if (value == null) {
      return undefined;
    }

    if (typeof value != 'object' && typeof value != 'string') {
      return JSON.stringify(value);
    }
    if (typeof value == 'string' && trim) {
      return value.trim();
    }
    return value;
  }));
}

export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function isArray(item) {
  return Array.isArray(item);
}

export function mergeDeep(target, ...sources) {
  target = target || {};
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key]) || isArray(source[key])) {
        if (!target[key]) {
          Object.assign(target, {[key]: {}});
        }
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {[key]: source[key]});
      }
    }
  } else if (isArray(target) && isArray(source)) {
    for (const el of source) {
      target.push(el);
    }
  }

  return mergeDeep(target, ...sources);
}

export function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

export function insertBefore(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode);
}

export function insertAt(el, referenceNode, index: number) {
  const child = referenceNode.children[index];
  child && insertBefore(el, child);
}

export function clone(obj: any, ignore: Array<string> = []) {
  if (obj == null) {
    return null;
  }
  if (isPrimitive(obj)) {
    return obj;
  }
  let instance = Object.create(Object.getPrototypeOf(obj));
  if (obj instanceof Array) {
    instance = obj.map(x => x);
  }

  return Object.assign(
    instance,
    Object.keys(obj)
      .filter(key => !ignore.includes(key))
      .reduce((result, key) => Object.assign(result, {[key]: clone(obj[key], ignore)}), {})
  );
}

export function isPrimitive(test) {
  return (test !== Object(test));
}

const {toString, hasOwnProperty} = Object.prototype;
const OBJECT_TYPE = '[object Object]';
const ARRAY_TYPE = '[object Array]';

export function flatten(obj: any, path?: string, result?: any) {
  const type = toString.call(obj);

  if (result === undefined) {
    if (type === OBJECT_TYPE) {
      result = {};
    } else if (type === ARRAY_TYPE) {
      result = [];
    } else {
      return;
    }
  }

  for (const key in obj) {
    if (!hasOwnProperty.call(obj, key)) {
      continue;
    }

    const val = obj[key];
    if (val == null) {
      continue;
    }

    switch (toString.call(val)) {
      case ARRAY_TYPE:
      case OBJECT_TYPE:
        if (toString.call(obj) == ARRAY_TYPE) {
          flatten(val, join(path, Number(key)), result);
        } else {
          flatten(val, join(path, key), result);
        }
        break;
      default:
        result[join(path, key)] = val;
        break;
    }
  }

  return result;
}

function join(path: string | void, key: any) {
  if (path != null) {
    if (typeof key == 'string') {
      return path + '.' + key;
    } else {
      return path + '[' + key + ']';
    }
  } else {
    return key;
  }
}

export function remove(items, index) {
  return [...items.slice(0, index),
    ...items.slice(index + 1, items.length)];
}

export function getUniqueArray(array: any[], attr?: string): any[] {
  if (attr) {
    return Array.from(new Set((array || []).map(e => e[attr]))).map(e => array.find(elem => elem[attr] == e));
  } else {
    return Array.from(new Set((array || [])));
  }
}

export function safetyCall(json: any, ...keys: string[]): any {
  if (json == null) {
    return null;
  }

  if (keys == null || keys.length == 0) {
    return json;
  }

  json = json[keys[0]];
  keys.splice(0, 1);
  if (keys.length == 0) {
    return json;
  } else {
    return safetyCall(json, ...keys);
  }
}

export function findParentWithClasses(el: Element, ...clazz: string[]): Element {
  if (el == null) {
    return null;
  }
  if (clazz == null) {
    return el;
  }

  if (clazz.filter(cls => el.classList.contains(cls)).length == clazz.length) {
    return el;
  }

  return findParentWithClasses(el.parentElement, ...clazz);
}


export function scrollIntoView(el: Element, offset?: { top?: number, bottom?: number, left?: number, right?: number }) {
  const scrollableParent = findScrollableParent(el);
  const childShape = el.getBoundingClientRect() as any;
  const parentShape = scrollableParent.getBoundingClientRect();
  offset = Object.assign({top: 0, bottom: 0, left: 0, right: 0}, offset);

  if (childShape.top < parentShape.top + offset.top) {
    scrollableParent.scrollTop -= parentShape.top + offset.top - childShape.top;
  } else if (childShape.bottom > parentShape.bottom - offset.bottom) {
    scrollableParent.scrollTop += childShape.bottom - parentShape.bottom + offset.bottom;
  }

  if (childShape.left < parentShape.left + offset.left) {
    scrollableParent.scrollLeft -= parentShape.left + offset.left - childShape.left;
  } else if (childShape.right > parentShape.right - offset.right) {
    scrollableParent.scrollLeft += childShape.right - parentShape.right + offset.right;
  }
}


function findScrollableParent(el: Element): Element {
  let isBody;

  do {
    el = el.parentElement;

    isBody = el === document.body;
  } while (isBody === false && isScrollable(el) === false);

  isBody = null;

  return el;
}

function isScrollable(el: Element): boolean {
  const isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
  const isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');

  return isScrollableY || isScrollableX;
}

function canOverflow(el: Element, axis: 'Y' | 'X'): boolean {
  const overflowValue = window.getComputedStyle(el, null)['overflow' + axis];

  return overflowValue === 'auto' || overflowValue === 'scroll';
}

function hasScrollableSpace(el: Element, axis: 'Y' | 'X'): boolean {
  if (axis === 'Y') {
    return el.clientHeight < el.scrollHeight;
  }

  if (axis === 'X') {
    return el.clientWidth < el.scrollWidth;
  }
}

export function resizeWindowByPopup(dialogWidth, dialogHeight): () => void {
  let resized = false;

  const parentWidth = document.documentElement.clientWidth;
  const parentHeight = document.documentElement.clientHeight;

  const difWidth = window.outerWidth - window.innerWidth;
  const difHeight = window.outerHeight - window.innerHeight;
  const padding = 100;

  const increaseWidth = dialogWidth + difWidth + padding;
  const increaseHeight = dialogHeight + difHeight + padding;

  if (dialogWidth > parentWidth || dialogHeight > parentHeight) {
    window.resizeTo(increaseWidth, increaseHeight);
    resized = true;
  }

  return () => {
    if (resized) {
      window.resizeTo(parentWidth + difWidth, parentHeight + difHeight);
    }
  };
}

const canvas = document.createElement('canvas');

export function measureTextWidth(textValue: string, font = '12px Verdana, Georgia, sans-serif'): number {
  // re-use canvas object for better performance
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(textValue);
  return metrics.width;
}


export function removeIf(arr: any[], callback: (el: any, index: number) => boolean) {
  if (!arr || !callback) {
    return;
  }

  let i = arr.length;
  while (i--) {
    if (callback(arr[i], i)) {
      arr.splice(i, 1);
    }
  }
}

export function prettyTimeDifference(now: number, past: number): string {
  if (now < past) {
    throw new Error('current date is lower than past date');
  }

  const secondsDiff = Math.floor((now - past) / 1000);
  if (secondsDiff < 60) {
    return 'less than a minute ago';
  }

  const minutesDiff = Math.floor(secondsDiff / 60);
  if (minutesDiff < 60) {
    if (minutesDiff == 1) {
      return 'one minute ago';
    }

    return minutesDiff + ' minutes ago';
  }

  const hoursDiff = Math.floor(minutesDiff / 60);
  if (hoursDiff < 24) {
    if (hoursDiff == 1) {
      return 'one hour ago';
    }

    return hoursDiff + ' hours ago';
  }

  const daysDiff = Math.floor(hoursDiff / 24);
  if (daysDiff < 30) {
    if (daysDiff == 1) {
      return 'one day ago';
    }

    return daysDiff + ' days ago';
  }

  const monthsDiff = Math.floor(daysDiff / 30);
  return monthsDiff == 1 ? 'one month ago' : monthsDiff + ' months ago';
}

export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position: fixed; left: -99999em';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copyEmptyTextFunc = (event) => {
      if (text == '') {
        event.clipboardData.setData('text/plain', '');
        event.preventDefault();
      }
    };

    textarea.addEventListener('copy', copyEmptyTextFunc);
    document.execCommand('copy');
    textarea.removeEventListener('copy', copyEmptyTextFunc);

    document.body.removeChild(textarea);
  } else {
    navigator.clipboard.writeText(text);
  }
}
