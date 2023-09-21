document.querySelector("#assignee")!.innerHTML =
    users.map((user, index) => `<option value="${index}">${user.username}</option>`).join("");

document.forms.namedItem("createIssue")!.addEventListener("submit", (e) => {
    const storyPoints = Number(e.target.elements.storyPoints!.value);

    createIssue({
        id: crypto.randomUUID(),
        title: e.target.elements.title!.value,
        description: e.target.elements.description!.value,
        storyPoints,
        remainingWork: storyPoints,
        assignee: e.target.elements.assignee!.value,
        status: "New",
    });

    window.location.href = "index.html#details";
});