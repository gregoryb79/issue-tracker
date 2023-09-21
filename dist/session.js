"use strict";
const users = JSON.parse(localStorage.getItem("users") || "[{ \"username\": \"admin\", \"password\": \"admin\" }]");
const currentUser = sessionStorage.getItem("user");
if (!currentUser && window.location.pathname !== "/login.html") {
    window.location.href = "login.html";
    throw new Error("User is not logged in.");
}
document.querySelector("#username").textContent = currentUser;
document.querySelector("#logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("user");
    window.location.href = "login.html";
});
class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid username or password.");
    }
}
function createUser(username, password) {
    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
}
function login(usernmae, password) {
    const user = users.find((user) => user.username === usernmae && user.password === password);
    if (!user) {
        throw new InvalidCredentialsError();
    }
    sessionStorage.setItem("user", user.username);
}
