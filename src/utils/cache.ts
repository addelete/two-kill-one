export class CacheUtils {
  static getItem<T>(key: string, defaultValue?: T | (() => T), saveDefaultToCache?: boolean): T {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value) as T;
    }
    const newValue = typeof defaultValue === 'function'
      ? (defaultValue as Function)()
      : defaultValue;
    if (saveDefaultToCache) {
      CacheUtils.setItem(key, newValue);
    }
    return newValue;
  }

  static setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static removeItem(key: string) {
    localStorage.removeItem(key);
  }
}
