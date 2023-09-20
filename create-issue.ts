document.querySelector("#assignee")!.innerHTML =
    users.map((user) => `<option value="${user.username}">${user.username}</option>`).join("");

document.forms.namedItem("createIssue")!.addEventListener("submit", (e) => {
    createIssue({
        id: crypto.randomUUID(),
        title: e.target.elements.title!.value,
        description: e.target.elements.description!.value,
        storyPoints: Number(e.target.elements.storyPoints!.value),
        assignee: e.target.elements.assignee!.value,
        status: "New",
    });

    window.location.href = "index.html#details";
});