const Auth = {
  isLoggedIn() {
    try {
      const raw = localStorage.getItem(CONFIG.AUTH_STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return Boolean(data && data.email);
    } catch {
      return false;
    }
  },

  getUser() {
    try {
      const raw = localStorage.getItem(CONFIG.AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  login(email) {
    const payload = {
      email: email.trim(),
      loggedInAt: new Date().toISOString(),
    };

    // file:// 로 열면 브라우저가 localStorage 를 막는 경우가 있다.
    // 그때는 예외를 삼키지 않고 null 을 돌려, 화면에서 안내를 띄운다.
    try {
      localStorage.setItem(CONFIG.AUTH_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      return null;
    }

    return payload;
  },

  logout() {
    localStorage.removeItem(CONFIG.AUTH_STORAGE_KEY);
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = "index.html";
      return false;
    }
    return true;
  },

  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = "home.html";
      return true;
    }
    return false;
  },
};
