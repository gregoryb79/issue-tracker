"use strict";
const dateFromatter = new Intl.DateTimeFormat();
const detailsView = document.querySelector("#details-view");
const sprintBoard = document.querySelector("#sprint-board");
document.querySelector("#assignee").innerHTML =
    users.map((user) => `<option value="${user.username}">${user.username}</option>`).join("");
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
    bindNavigationLinks();
}
function navigate(e) {
    e.preventDefault();
    history.pushState({}, "Issue Tracker", e.target.href);
    updateView();
}
function bindNavigationLinks() {
    document.querySelectorAll("[data-link]").forEach((el) => el.addEventListener("click", navigate));
}
updateView();
window.addEventListener("hashchange", updateView);
function showDetailsView() {
    detailsView.classList.remove("hidden");
    sprintBoard.classList.add("hidden");
    if (!issues.length) {
        detailsView.querySelector(".sidebar").classList.add("hidden");
        detailsView.querySelector("#no-issues-cta").classList.remove("hidden");
        return;
    }
    const currentIssueId = new URLSearchParams(window.location.search).get("issueId");
    const currentIssue = issues.find((issue) => issue.id === currentIssueId);
    document.querySelector("#issue-list").innerHTML =
        issues.map((issue) => `<li title="${issue.title}" class="ellipsis short-text">${issue === currentIssue ?
            issue.title :
            `<a data-link href="?issueId=${issue.id}#details">${issue.title}</a>`}</li>`).join("");
    if (!currentIssue) {
        document.forms.namedItem("editIssue")?.classList.add("hidden");
        if (currentIssueId) {
            detailsView.querySelector("#issue-not-found-message")?.classList.remove("hidden");
        }
        return;
    }
    document.querySelector("#created-by").textContent = currentIssue.createdBy;
    document.querySelector("#created-at").textContent = dateFromatter.format(currentIssue.createdAt);
    document.querySelector("#created-at").setAttribute("datetime", currentIssue.createdAt.toString());
    document.forms.namedItem("editIssue")?.classList.remove("hidden");
    document.forms.namedItem("editIssue").elements.title.value = currentIssue.title;
    document.forms.namedItem("editIssue").elements.status.value = currentIssue.status;
    document.forms.namedItem("editIssue").elements.assignee.value = currentIssue.assignee;
    document.forms.namedItem("editIssue").elements.storyPoints.value = currentIssue.storyPoints.toString();
    document.forms.namedItem("editIssue").elements.remainingWork.value = currentIssue.remainingWork.toString();
    document.forms.namedItem("editIssue").elements.description.value = currentIssue.description;
    document.forms.namedItem("editIssue").addEventListener("submit", (e) => {
        currentIssue.title = e.target.elements.title.value;
        currentIssue.status = e.target.elements.status.value;
        currentIssue.assignee = e.target.elements.assignee.value;
        currentIssue.storyPoints = parseInt(e.target.elements.storyPoints.value);
        currentIssue.description = e.target.elements.description.value;
        saveIssues();
        document.querySelector("#toaster").appendChild(toast("Issue saved."));
    });
}
function showSprintBoard() {
    detailsView.classList.add("hidden");
    sprintBoard.classList.remove("hidden");
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
            issue.status = e.target.getAttribute("data-status");
            saveIssues();
            const cardToMove = document.querySelector(`[data-id="${issueId}"]`);
            const originalPosition = cardToMove.getBoundingClientRect();
            const cardsToSlide = getCardsUnder(cardToMove);
            const slidingCardsOriginalPositions = cardsToSlide.map((card) => card.getBoundingClientRect());
            e.currentTarget.appendChild(cardToMove);
            const updatedPosition = cardToMove.getBoundingClientRect();
            cardToMove.style.setProperty("translate", `${originalPosition.x - updatedPosition.x}px ${originalPosition.y - updatedPosition.y}px`);
            cardToMove.style.setProperty("width", `${originalPosition.width}px`);
            cardToMove.style.setProperty("top", `${updatedPosition.top}px`);
            cardToMove.style.setProperty("position", "fixed");
            cardsToSlide.forEach((card, i) => {
                const updatedPosition = card.getBoundingClientRect();
                card.style.setProperty("translate", `0 ${slidingCardsOriginalPositions[i].y - updatedPosition.y}px`);
            });
            requestAnimationFrame(() => {
                cardToMove.style.setProperty("transition", "translate 400ms ease-in-out");
                cardToMove.style.setProperty("translate", "0");
                cardsToSlide.forEach((card) => {
                    card.style.setProperty("transition", "translate 400ms ease-in-out");
                    card.style.setProperty("translate", "0");
                });
                setTimeout(() => {
                    cardToMove.style.setProperty("transition", null);
                    cardToMove.style.setProperty("translate", null);
                    cardToMove.style.setProperty("width", null);
                    cardToMove.style.setProperty("top", null);
                    cardToMove.style.setProperty("position", null);
                    cardsToSlide.forEach((card) => {
                        card.style.setProperty("transition", null);
                        card.style.setProperty("translate", null);
                    });
                }, 400);
            });
        });
    });
}
function getCardsUnder(card) {
    if (!card.nextElementSibling) {
        return [];
    }
    let currentCard = card.nextElementSibling;
    const cards = [];
    while (currentCard.nextElementSibling) {
        cards.push(currentCard.nextElementSibling);
        currentCard = currentCard.nextElementSibling;
    }
    return cards;
}
function toCard(issue) {
    return `<li draggable="true" data-id="${issue.id}" class="surface gutter flow rounded-corners">
        <h4 title="${issue.title}" class="ellipsis"><a data-link href="?issueId=${issue.id}#details">${issue.title}</a></h4>
        <div class="cluster cluster--distribute">
            <p>${issue.assignee}</p>
            <p><span title="Remaining work">${issue.remainingWork}</span> / <span title="Story points">${issue.storyPoints}</span></p>
        </div>
    </li>`;
}
function toast(text, durationInMs = 5000) {
    const toastElement = document.createElement("div");
    toastElement.textContent = text;
    toastElement.classList.add("toast", "toast--success", "surface", "rounded-corners");
    toastElement.style.setProperty("--duration", `${durationInMs}ms`);
    setTimeout(() => toastElement.remove(), durationInMs);
    return toastElement;
}
