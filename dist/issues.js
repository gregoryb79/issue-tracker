"use strict";
const issues = JSON.parse(localStorage.getItem("issues") || "[]");
function createIssue(issue) {
    issues.push(issue);
    saveIssues();
}
function saveIssues() {
    localStorage.setItem("issues", JSON.stringify(issues));
}
