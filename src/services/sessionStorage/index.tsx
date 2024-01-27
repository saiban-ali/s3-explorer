class SessionStorage {
  static get(key: string) {
    return sessionStorage.getItem(key);
  }

  static set(key: string, value?: string) {
    if (value) {
      sessionStorage.setItem(key, value);
    }
  }

  static remove(key: string) {
    sessionStorage.removeItem(key);
  }

  static clear() {
    sessionStorage.clear();
  }
}

export default SessionStorage;
