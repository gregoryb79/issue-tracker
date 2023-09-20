type User = {
    username: string;
    password: string;
};

const users = JSON.parse(
    localStorage.getItem("users") || "[{ \"username\": \"admin\", \"password\": \"admin\" }]"
) as User[];

const currentUser = sessionStorage.getItem("user");

if (!currentUser && window.location.pathname !== "/login.html") {
    window.location.href = "login.html";
    throw new Error("User is not logged in.");
}

if (document.querySelector(".app-menu")) {
    document.querySelector(".app-menu .username")!.textContent = currentUser;

    document.querySelector("#logoutButton")!.addEventListener("click", () => {
        sessionStorage.removeItem("user");
        window.location.href = "login.html";
    });
}

class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid username or password.");
    }
}

function createUser(username: string, password: string) {
    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
}

function login(usernmae: string, password: string) {
    const user = users.find((user) => user.username === usernmae && user.password === password);

    if (!user) {
        throw new InvalidCredentialsError();
    }

    sessionStorage.setItem("user", user.username);
}