/**
 * Creates a switch section element with Yes/No buttons.
 * @param {string} label - The heading text for the switch
 * @param {(enabled: boolean) => void} [changedCallback] - Runs whenever the state changes
 * @param {boolean} [defaultEnabled=true] - Initial enabled state
 * @param {boolean} [addToBody=true] -Adds it to the body by default
 * @returns {HTMLDivElement}
 */
export function createSwitch(label, changedCallback, defaultEnabled = true, addToBody = true) {
    const sw = document.createElement("div");
    sw.className = `section switch ${defaultEnabled ? "enabled" : "disabled"}`;

    const heading = document.createElement("h3");
    heading.textContent = label;

    const confirmButton = document.createElement("button");
    confirmButton.className = "interface confirm";
    confirmButton.textContent = "Yes";
    confirmButton.disabled = defaultEnabled;

    const denyButton = document.createElement("button");
    denyButton.className = "interface deny";
    denyButton.textContent = "No";
    denyButton.disabled = !defaultEnabled;

    const setEnabled = (enabled) => {
        sw.classList.toggle("enabled", enabled);
        sw.classList.toggle("disabled", !enabled);
        confirmButton.disabled = enabled;
        denyButton.disabled = !enabled;

        sw.dispatchEvent(new CustomEvent("switchchange", { detail: { enabled } }));
        if (changedCallback) changedCallback(enabled);
    };

    confirmButton.addEventListener("click", () => setEnabled(true));
    denyButton.addEventListener("click", () => setEnabled(false));

    sw.append(heading, confirmButton, denyButton);
    document.body.appendChild(sw);
    return sw;
}