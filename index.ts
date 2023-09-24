const dateFromatter = new Intl.DateTimeFormat()
const detailsView = document.querySelector("#details-view")!;
const sprintBoard = document.querySelector("#sprint-board")!;

document.querySelector("#assignee")!.innerHTML =
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

function navigate(e: MouseEvent) {
    e.preventDefault();
    history.pushState({}, "Issue Tracker", (e.target as HTMLAnchorElement).href);
    updateView();
}

function bindNavigationLinks() {
    document.querySelectorAll("[data-link]").forEach((el) => (el as HTMLAnchorElement).addEventListener("click", navigate));
}

updateView();

window.addEventListener("hashchange", updateView);
window.addEventListener("popstate", updateView);

function showDetailsView() {
    detailsView.classList.remove("hidden");
    sprintBoard.classList.add("hidden");

    if (!issues.length) {
        detailsView.querySelector(".sidebar")!.classList.add("hidden");
        detailsView.querySelector("#no-issues-cta")!.classList.remove("hidden");

        return;
    }

    const currentIssueId = new URLSearchParams(window.location.search).get("issueId");
    const currentIssue = issues.find((issue) => issue.id === currentIssueId);

    document.querySelector("#issue-list")!.innerHTML =
        issues.map((issue) => `<li title="${issue.title}" class="ellipsis short-text">${issue === currentIssue ?
            issue.title :
            `<a data-link href="?issueId=${issue.id}#details">${issue.title}</a>`
            }</li>`).join("");

    if (!currentIssue) {
        document.forms.namedItem("editIssue")?.classList.add("hidden");

        if (currentIssueId) {
            detailsView.querySelector("#issue-not-found-message")?.classList.remove("hidden");
        }

        return;
    }

    document.forms.namedItem("editIssue")?.classList.remove("hidden");
    detailsView.querySelector("#issue-not-found-message")?.classList.add("hidden");

    document.querySelector("#created-by")!.textContent = currentIssue.createdBy;
    document.querySelector("#created-at")!.textContent = dateFromatter.format(currentIssue.createdAt);
    document.querySelector("#created-at")!.setAttribute("datetime", currentIssue.createdAt.toString());

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

            const cardToMove = document.querySelector(`[data-id="${issueId}"]`) as HTMLElement;
            const originalPosition = cardToMove.getBoundingClientRect();

            const cardsToSlide = getCardsUnder(cardToMove);
            const slidingCardsOriginalPositions = cardsToSlide.map((card) => card.getBoundingClientRect());

            (e.currentTarget as Element).appendChild(cardToMove);

            const updatedPosition = cardToMove.getBoundingClientRect();

            cardToMove.style.setProperty("translate", `${originalPosition.x - updatedPosition.x}px ${originalPosition.y - updatedPosition.y}px`);
            cardToMove.style.setProperty("width", `${originalPosition.width}px`);
            cardToMove.style.setProperty("top", `${updatedPosition.top}px`);
            cardToMove.style.setProperty("position", "fixed");

            cardsToSlide.forEach((card, i) => {
                const updatedPosition = card.getBoundingClientRect();

                card.style.setProperty("translate", `0 ${slidingCardsOriginalPositions[i].y - updatedPosition.y}px`);
            })

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

function getCardsUnder(card: HTMLElement) {
    let currentCard = card;
    const cards = [] as HTMLElement[];

    while (currentCard.nextElementSibling) {
        cards.push(currentCard.nextElementSibling as HTMLElement);
        currentCard = currentCard.nextElementSibling as HTMLElement;
    }

    return cards;
}

function toCard(issue: Issue) {
    return `<li draggable="true" data-id="${issue.id}" class="surface gutter flow rounded-corners">
        <h4 title="${issue.title}" class="ellipsis"><a data-link href="?issueId=${issue.id}#details">${issue.title}</a></h4>
        <div class="cluster cluster--distribute">
            <p>${issue.assignee}</p>
            <p><span title="Remaining work">${issue.remainingWork}</span> / <span title="Story points">${issue.storyPoints}</span></p>
        </div>
    </li>`
}
