import { terminal, initializeTerminal, ConsoleObject } from "./console.js"
import { CommandManager } from './commands.js';
import {getMobile} from "./constants.js";
import { formatString } from "./strings.js";
import { createWindow, registerWindow, alertUser } from "./window_utils.js";
/**
 * Dynamically creates, mounts, and initializes a new terminal window.
 *
 * @param {ConsoleObject} terminal
 * @param {number} [options.x=80] - Initial X position.
 * @param {number} [options.y=80] - Initial Y position.
 * @param {CommandManager | null} [copyCommands] - If you want your own set of commands or just to use the default (pass in a commands object to copy from)
 * @returns {{ windowElement: HTMLElement, win: Object }} The created DOM element and registered window instance.
 */
export async function createTerminalWindow(
    x = 80,
    y = 80,
    title = "Terminal",
    copyCommands = null
) {

    // 1. Create the base window
    const windowElement = await createWindow(x, y, title);

    // 2. Build and inject the terminal DOM structure
    const contentContainer = windowElement.querySelector(".window-content") || windowElement;
    contentContainer.insertAdjacentHTML("beforeend", `
        <div class="info-section">
            <p>moakdoge.dev</p>
        </div>
        <div class="term-log" id="term-log">
            <div class="input" id="input-prompt">
                <span class="prompt" id="prompt-text">${prompt}</span>
                <input class="command-box" id="command-input" value="${'work'}" spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off">
            </div
        </div>
    `);

    async function submitPrompt(rawInput) {
        await terminal.resizeLog();
        let success = await windowElement._commands.run(rawInput);
        if (!success) {
            await terminal.raise(rawInput, "Command %s is not found.");
        }

        await terminal.toBottom();
    }



    // 3. Query elements scoped to THIS window instance
    const titleBar = windowElement.querySelector(".title-bar");
    const closeButton = windowElement.querySelector(".close-button");
    const terminalLog = windowElement.querySelector(".term-log");
    const inputPrompt = windowElement.querySelector(".input");
    const inputPromptText = windowElement.querySelector(".prompt");
    const commandInput = windowElement.querySelector(".command-box");
    let terminal = initializeTerminal(terminalLog,inputPrompt, windowElement, inputPromptText, commandInput, submitPrompt);
    // 4. Register window & custom close behavior
    const win = registerWindow(windowElement, titleBar, closeButton);

    
    let commands = new CommandManager(terminal);
    if (copyCommands) {
        commands.commands = copyCommands.commands;
    }
    
    windowElement._commands  = commands;


    // 6. Handle mobile layout & viewport listeners
    if (getMobile()) {
        windowElement.style.width = "100%";
        windowElement.style.height = "80%";
        document.documentElement.style.setProperty("--mobile-visible", "none");
        terminal.resizeLog();

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", () => terminal.resizeLog());
            window.visualViewport.addEventListener("scroll", () => terminal.resizeLog());
        }
    }

    terminal.initPrompt();
    terminalLog.addEventListener("click", (e) => {
    if (document.activeElement != commandInput) {
        commandInput.focus({ preventScroll: true });
    }

})
    windowElement.addEventListener('click', async (e) => {
        const cmdElement = e.target.closest('.command-text');
        if (cmdElement) {
            e.preventDefault();
            const command = cmdElement.dataset.command || cmdElement.textContent;
            commandInput.value = String(command).trim();
            if (getMobile()) {
                await terminal.toBottom();
            }
            await terminal.prompt(commandInput.value); 2
            await terminal.initPrompt();
        }
    })


    return {windowElement: windowElement, win:win, terminal:terminal, commands: commands};
}

/** @type {CommandManager} */
let commands;
let out = await createTerminalWindow();
commands = out.commands;
export let getCommands = () => {return commands;};



