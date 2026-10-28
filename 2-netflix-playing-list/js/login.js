document.addEventListener("DOMContentLoaded", () => {
  Auth.redirectIfLoggedIn();

  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorEl = document.getElementById("login-error");

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.classList.remove("is-visible");
    emailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      if (!email) emailInput.classList.add("is-invalid");
      if (!password) passwordInput.classList.add("is-invalid");
      showError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!isValidEmail(email)) {
      emailInput.classList.add("is-invalid");
      showError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }

    if (password.length < 4) {
      passwordInput.classList.add("is-invalid");
      showError("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    const session = Auth.login(email);

    // 저장에 실패하면 홈으로 보내도 바로 로그인 화면으로 돌아온다.
    if (!session) {
      showError(
        "파일을 직접 열면 로그인 정보를 저장할 수 없습니다. 주소창에 http://localhost:5500 을 입력한 뒤 다시 로그인해 주세요."
      );
      return;
    }

    window.location.href = "home.html";
  });

  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener("input", clearError);
  });
});
