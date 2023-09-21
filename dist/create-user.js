"use strict";
document.forms.namedItem("createUser")?.addEventListener("submit", (e) => {
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;
    const confirmPassword = e.target.elements.confirmPassword.value;
    if (password !== confirmPassword) {
        setFormError(e.target, "Passwords do not match.");
        return;
    }
    if (users.some((user) => user.username === username)) {
        setFormError(e.target, "Username already exists.");
        return;
    }
    createUser(username, password);
    window.location.href += "index.html#details";
});
