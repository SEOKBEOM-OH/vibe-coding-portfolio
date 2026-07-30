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
    localStorage.setItem(CONFIG.AUTH_STORAGE_KEY, JSON.stringify(payload));
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
