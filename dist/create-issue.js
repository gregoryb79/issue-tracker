"use strict";
document.querySelector("#assignee").innerHTML =
    users.map((user, index) => `<option value="${index}">${user.username}</option>`).join("");
document.forms.namedItem("createIssue").addEventListener("submit", (e) => {
    if (!currentUser) {
        setFormError(e.target, "Must be logged in to create an issue.");
        return;
    }
    const storyPoints = Number(e.target.elements.storyPoints.value);
    createIssue({
        id: crypto.randomUUID(),
        title: e.target.elements.title.value,
        createdBy: currentUser,
        createdAt: new Date().valueOf(),
        description: e.target.elements.description.value,
        storyPoints,
        remainingWork: storyPoints,
        assignee: e.target.elements.assignee.value,
        status: "New",
    });
    window.location.href = "index.html#details";
});
