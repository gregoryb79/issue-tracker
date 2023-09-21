const detailsView = document.querySelector("#details-view")!;
const sprintBoard = document.querySelector("#sprint-board")!;

function updateView() {
    switch (window.location.hash) {
        case "#details":
            showDetailsView();
            break;
        case "#sprint":
            showSprintBoard();
            break;
        default:
            window.location.hash = "#details";
    }
}

updateView();

window.addEventListener("hashchange", updateView);

function showDetailsView() {
    detailsView.classList.remove("hidden");
    sprintBoard.classList.add("hidden");

    if (!issues.length) {
        detailsView.querySelector(".sidebar")!.classList.add("hidden");
        detailsView.querySelector("#no-issues-cta")!.classList.remove("hidden");

        return;
    }

    document.querySelector("#issue-list")!.innerHTML =
        issues.map((issue) => `<li title="${issue.title}" class="ellipsis short-text"><a href="?issueId=${issue.id}#details">${issue.title}</a></li>`).join("");

    document.querySelector("#assignee")!.innerHTML =
        users.map((user) => `<option value="${user.username}">${user.username}</option>`).join("");

    const currentIssueId = new URLSearchParams(window.location.search).get("issueId");
    const currentIssue = issues.find((issue) => issue.id === currentIssueId);

    if (!currentIssue) {
        document.forms.namedItem("editIssue")?.classList.add("hidden");

        if (currentIssueId) {
            detailsView.querySelector("#issue-not-found-message")?.classList.remove("hidden");
        }

        return;
    }

    document.forms.namedItem("editIssue")!.elements.title!.value = currentIssue.title;
    document.forms.namedItem("editIssue")!.elements.status!.value = currentIssue.status;
    document.forms.namedItem("editIssue")!.elements.assignee!.value = currentIssue.assignee;
    document.forms.namedItem("editIssue")!.elements.storyPoints!.value = currentIssue.storyPoints.toString();
    document.forms.namedItem("editIssue")!.elements.remainingWork!.value = currentIssue.remainingWork.toString();
    document.forms.namedItem("editIssue")!.elements.description!.value = currentIssue.description;
    document.forms.namedItem("editIssue")!.addEventListener("submit", (e) => {
        currentIssue!.title = (e.target as HTMLFormElement).elements.title!.value;
        currentIssue!.status = (e.target as HTMLFormElement).elements.status!.value as Issue["status"];
        currentIssue!.assignee = (e.target as HTMLFormElement).elements.assignee!.value as Issue["assignee"];
        currentIssue!.storyPoints = Number((e.target as HTMLFormElement).elements.storyPoints!.value);
        currentIssue!.remainingWork = Number((e.target as HTMLFormElement).elements.remainingWork!.value);
        currentIssue!.description = (e.target as HTMLFormElement).elements.description!.value;

        saveIssues();
    });
}

function showSprintBoard() {
    detailsView.classList.add("hidden");
    sprintBoard.classList.remove("hidden");
}

function toCard(issue: Issue) {
    return `<li draggable="true" data-id="${issue.id}">
        <h4 title="${issue.title}" class="ellipsis"><a href="?issueId=${issue.id}#details">${issue.title}</a></h4>
        <div class="cluster cluster--distribute">
            <p>${issue.assignee}</p>
            <p><span title="Remaining work">${issue.remainingWork}</span> / <span title="Story points">${issue.storyPoints}</span></p>
        </div>
    </li>`
}

document.querySelector("#new-column")!.innerHTML =
    issues.filter((issue) => issue.status === "New").map(toCard).join("");

document.querySelector("#in-progress-column")!.innerHTML =
    issues.filter((issue) => issue.status === "In Progress").map(toCard).join("");

document.querySelector("#done-column")!.innerHTML =
    issues.filter((issue) => issue.status === "Done").map(toCard).join("");

document.querySelector(".columns")!.addEventListener("dragstart", (e) => {
    if (!(e instanceof DragEvent) || !e.dataTransfer) {
        return;
    }

    const element = e.target as Element;

    if (!element.hasAttribute("data-id")) {
        e.preventDefault();
        return;
    }

    e.dataTransfer.setData("text/plain", (e.target as Element).getAttribute("data-id")!);

    document.body.classList.add("show-drop-zones");
});

document.querySelector(".columns")!.addEventListener("dragend", () => {
    document.body.classList.remove("show-drop-zones");
});

document.querySelectorAll("#new-column, #in-progress-column, #done-column")!.forEach((column) => {
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
        const issue = issues.find((issue) => issue.id === issueId)!;

        issue.status = (e.currentTarget as Element).getAttribute("data-status") as Issue["status"];
        saveIssues();

        (e.currentTarget as Element).appendChild(document.querySelector(`[data-id="${issueId}"]`)!);
    });
});
