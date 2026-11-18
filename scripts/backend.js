import { terminal, initializeTerminal } from "./console.js"
import { CommandManager } from './commands.js';
import {getMobile} from "./constants.js";
import { registerWindow } from "./window_utils.js";
const terminalLog = document.getElementById("term-log");
const inputPrompt = document.getElementById("input-prompt");
const inputPromptText = document.getElementById("prompt-text");
const commandInput = document.getElementById("command-input");
let attemptsToOpen = 0;




async function submitPrompt(rawInput) {
    await terminal.resizeLog();
    let success = await commands.run(rawInput);
    if (!success) {
        await terminal.raise(rawInput, "Command %s is not found.");
    }

    await terminal.toBottom();
}




terminalLog.addEventListener("click", (e) => {
    if (document.activeElement != commandInput) {
        commandInput.focus({ preventScroll: true });
    }

})


document.addEventListener('click', async (e) => {
    const cmdElement = e.target.closest('.command-text');
    if (cmdElement) {
        e.preventDefault();
        const command = cmdElement.dataset.command || cmdElement.textContent;
        commandInput.value = String(command).trim();
        if (getMobile()) {
            await scrollToBottom();
        }
        await terminal.prompt(commandInput.value); 2
        await terminal.initPrompt();
    }
})


const windowElement = document.getElementById("window");
const found = document.querySelector(".title-bar");
const foundB = document.querySelector(".close-button");
const win = registerWindow(windowElement, found, foundB, () => {
    attemptsToOpen += 1;
    if (attemptsToOpen >= 3) {
        alertUser("moakdoge", formatString("Go check out scatty at [scatty.ing](https://scatty.ing). Also, please stop trying to close this."));
        attemptsToOpen = 0;
        return false;
    }
    alertUser("System", "Why would you try to close this? ")
    return false;
});


initializeTerminal(
    terminalLog,
    inputPrompt,
    windowElement,
    inputPromptText,
    commandInput,
    submitPrompt
);

(async function () {
    if (getMobile()) {
        windowElement.style.width = "100%";
        windowElement.style.height = "95%";
        document.documentElement.style.setProperty('--mobile-visible', 'none');
        await terminal.resizeLog();
    }
})();

if (getMobile() && window.visualViewport) {
    window.visualViewport.addEventListener("resize", terminal.resizeLog);
    window.visualViewport.addEventListener("scroll", terminal.resizeLog);
}

terminal.initPrompt();

/** @type {CommandManager} */
export const commands = new CommandManager(terminal);