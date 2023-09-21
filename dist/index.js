"use strict";
if (!window.location.hash) {
    window.location.hash = "#details";
}
document.body.classList.add(window.location.hash === "#details" ? "show-details" : "show-sprint");
window.addEventListener("hashchange", () => {
    document.body.classList.toggle("show-details", window.location.hash === "#details");
    document.body.classList.toggle("show-sprint", window.location.hash === "#sprint");
});
if (!issues.length) {
    document.body.classList.add("no-issues");
}
document.querySelector("#issue-list").innerHTML =
    issues.map((issue) => `<li title="${issue.title}" class="ellipsis"><a href="?issueId=${issue.id}#details">${issue.title}</a></li>`).join("");
document.querySelector("#assignee").innerHTML =
    users.map((user) => `<option value="${user.username}">${user.username}</option>`).join("");
const currentIssueId = new URLSearchParams(window.location.search).get("issueId");
const currentIssue = issues.find((issue) => issue.id === currentIssueId);
if (!currentIssueId) {
    document.body.classList.add("no-issue-selected");
}
else if (!currentIssue) {
    document.body.classList.add("issue-not-found");
}
else {
    document.forms.namedItem("editIssue").querySelector("h3").textContent = currentIssue.title;
    document.forms.namedItem("editIssue").elements.status.value = currentIssue.status;
    document.forms.namedItem("editIssue").elements.assignee.value = currentIssue.assignee;
    document.forms.namedItem("editIssue").elements.storyPoints.value = currentIssue.storyPoints.toString();
    document.forms.namedItem("editIssue").elements.description.value = currentIssue.description;
}
document.forms.namedItem("editIssue").addEventListener("submit", (e) => {
    currentIssue.status = e.target.elements.status.value;
    currentIssue.assignee = e.target.elements.assignee.value;
    currentIssue.storyPoints = parseInt(e.target.elements.storyPoints.value);
    currentIssue.description = e.target.elements.description.value;
    saveIssues();
});
function toCard(issue) {
    return `<li draggable="true" data-id="${issue.id}">
        <h4 title="${issue.title}" class="ellipsis">${issue.title}</h4>
        <div class="cluster cluster--distribute">
            <p>${issue.assignee}</p>
            <p>${issue.storyPoints}</p>
        </div>
    </li>`;
}
document.querySelector("#new-column").innerHTML =
    issues.filter((issue) => issue.status === "New").map(toCard).join("");
document.querySelector("#in-progress-column").innerHTML =
    issues.filter((issue) => issue.status === "In Progress").map(toCard).join("");
document.querySelector("#done-column").innerHTML =
    issues.filter((issue) => issue.status === "Done").map(toCard).join("");
document.querySelector(".columns").addEventListener("dragstart", (e) => {
    if (!(e instanceof DragEvent) || !e.dataTransfer) {
        return;
    }
    e.dataTransfer.setData("text/plain", e.target.getAttribute("data-id"));
    document.body.classList.add("show-drop-zones");
});
document.querySelector(".columns").addEventListener("dragend", () => {
    document.body.classList.remove("show-drop-zones");
});
document.querySelectorAll("#new-column, #in-progress-column, #done-column").forEach((column) => {
    column.addEventListener("dragover", (e) => {
        if (!(e instanceof DragEvent) || !e.dataTransfer) {
            return;
        }
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    });
    column.addEventListener("drop", (e) => {
        if (!(e instanceof DragEvent) || !e.dataTransfer) {
            return;
        }
        e.preventDefault();
        const issueId = e.dataTransfer.getData("text/plain");
        const issue = issues.find((issue) => issue.id === issueId);
        issue.status = e.currentTarget.getAttribute("data-status");
        saveIssues();
        e.currentTarget.appendChild(document.querySelector(`[data-id="${issueId}"]`));
    });
});
