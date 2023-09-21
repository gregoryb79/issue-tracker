"use strict";
if (sessionStorage.getItem("user")) {
    window.location.href = "index.html";
    throw new Error("User is already logged in.");
}
document.forms.namedItem("login")?.addEventListener("submit", (e) => {
    try {
        login(e.target.elements.username.value, e.target.elements.password.value);
        window.location.href = "index.html";
    }
    catch (error) {
        if (!(error instanceof InvalidCredentialsError)) {
            throw error;
        }
        const errorMessage = e.target.querySelector(".form-error");
        if (!errorMessage) {
            alert(error.message);
            return;
        }
        errorMessage.textContent = error.message;
    }
});
