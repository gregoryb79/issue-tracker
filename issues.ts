type Issue = {
    id: string;
    title: string;
    description: string;
    storyPoints: number;
    remainingWork: number;
    assignee: string;
    status: "New" | "In Progress" | "Done";
};

const issues = JSON.parse(localStorage.getItem("issues") || "[]") as Issue[];

function createIssue(issue: Issue) {
    issues.push(issue);
    saveIssues();
}

function saveIssues() {
    localStorage.setItem("issues", JSON.stringify(issues));
}
