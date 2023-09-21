"use strict";
for (const form of document.forms) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        e.target.classList.add("was-validated");
        if (e.target.checkValidity()) {
            return;
        }
        e.stopImmediatePropagation();
        const firstInvalidControl = e.target.querySelector(":invalid");
        firstInvalidControl instanceof HTMLInputElement && firstInvalidControl.focus();
        for (const control of e.target.elements) {
            if (control instanceof HTMLButtonElement) {
                continue;
            }
            updateErrorMessage(control);
        }
        return;
    });
    form.addEventListener("input", (e) => {
        if (!(e.target instanceof HTMLInputElement)) {
            return;
        }
        updateErrorMessage(e.target);
    });
}
function updateErrorMessage(input) {
    const errorMessage = input.parentElement?.querySelector(".error-message");
    if (!errorMessage) {
        input.reportValidity();
        return;
    }
    errorMessage.textContent = input.validationMessage;
}
function setFormError(form, message) {
    const errorMessage = form.querySelector(".form-error");
    if (!errorMessage) {
        alert(message);
        return;
    }
    errorMessage.textContent = message;
}
