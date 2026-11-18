import * as strutils from './strings.js';
import {fileManager} from "./file_system.js";
import {terminal, initializeTerminal} from "./console.js"
import { CommandManager } from './commands.js';
const terminalLog = document.getElementById("term-log");
const inputPrompt = document.getElementById("input-prompt");
const inputPromptText = document.getElementById("prompt-text");
const commandInput = document.getElementById("command-input");
const mainBody = document.getElementById("main-body");
export const mobileUser = window.innerWidth < 640;
const startupTime = new Date();
let attemptsToOpen = 0;


export async function getStartupTime() {
    return startupTime;
}
/** @type {string[]} */
export let username = "root";
export let hostname = "moakdoge.dev";

let windowElements = [];





async function getPrompt() {
    let prompt = `${username}@${hostname}`
    let path = await fileManager.getDirectory();
    let final =`${prompt} (${path}) ❯ `
    return final;
}






async function submitPrompt(rawInput) {
    await terminal.resizeLog();
    let success = commands.run(rawInput);
    if (!success) {
        await terminal.raise(parts[0], exceptions.notFound);
    }

    await terminal.toBottom();
}



async function createWindow(w, h, title, closeCallback) {
    const newElement = document.createElement("div");
    newElement.className = "window";
    newElement.style.zIndex = 999;
    newElement.style.width = `${String(w)}%`;
    newElement.style.height = `${String(h)}%`;
    mainBody.appendChild(newElement)

    const titleBar = document.createElement("div")
    titleBar.className = "title-bar"
    newElement.appendChild(titleBar);

    const titleItem = document.createElement("p");
    titleBar.appendChild(titleItem);
    titleItem.innerText = title;

    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.innerText = "X";
    titleBar.appendChild(closeButton);


    registerWindow(newElement, titleBar, closeButton, closeCallback);
    return newElement;
}




function registerWindow(windowElement, titleBar, closeButton, closeCallback) {
    let dragOffset = null;

    windowElements.push(windowElement);
    titleBar.addEventListener("pointerdown", (e) => {
        if (!mobileUser) {
            const bounds = windowElement.getBoundingClientRect();
            dragOffset = {
                x: e.clientX - bounds.left,
                y: e.clientY - bounds.top
            };
            titleBar.setPointerCapture(e.pointerId);
            titleBar.style.cursor = "grabbing";
        }
    });
    
    function focusWindow() {
        windowElement.style.zIndex = 1;
        windowElement.classList.add("focused");
        windowElement.classList.remove("unfocused")
        for (const otherWindow of windowElements) {
            if (otherWindow === windowElement) {
                continue;
            }
            otherWindow.classList.remove("focused");
            otherWindow.classList.add("unfocused");
            otherWindow.style.zIndex = 0;
        }
    }

    windowElement._focus = focusWindow;
    windowElement.addEventListener("pointerdown", (e) => {
        focusWindow()
    })


    focusWindow();

    closeButton.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
    });

    closeButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (closeCallback != undefined && closeCallback != null) {
            let doClose = true;
            try {
                doClose = closeCallback();
            } catch {
                doClose = false;
            }
            if (!doClose) {
                return;
            }
        }
            const windowIndex = windowElements.indexOf(windowElement);
            if (windowIndex !== -1) {
                windowElements.splice(windowIndex, 1);
            }

        windowElement.remove();
        if (windowElements.length > 0) {
            windowElements[0]._focus();
        }
    });

    titleBar.addEventListener("pointermove", (e) => {
        if (dragOffset === null) {
            return;
        }

        windowElement.style.position = "fixed";
        windowElement.style.transform = "none";
        windowElement.style.left = `${e.clientX - dragOffset.x}px`;
        windowElement.style.top = `${e.clientY - dragOffset.y}px`;
    });

    const stopDragging = (e) => {
        dragOffset = null;
        titleBar.releasePointerCapture?.(e.pointerId);
        titleBar.style.cursor = "grab";
    };

    titleBar.addEventListener("pointerup", stopDragging);
    titleBar.addEventListener("pointercancel", stopDragging);

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
        if (mobileUser) {
            await scrollToBottom();
        }
        await terminal.prompt(commandInput.value);2
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
    mobileUser,
    inputPromptText,
    commandInput,
    submitPrompt
);
terminal.getPrompt = getPrompt;
(async function (){
    if (mobileUser) {
        windowElement.style.width = "100%";
        windowElement.style.height = "95%";
        document.documentElement.style.setProperty('--mobile-visible', 'none');
        await terminal.resizeLog();
    }
})();

if (mobileUser && window.visualViewport) {
    window.visualViewport.addEventListener("resize", terminal.resizeLog);
    window.visualViewport.addEventListener("scroll", terminal.resizeLog);
}

terminal.initPrompt();

/** @type {CommandManager} */
export const commands = new CommandManager(terminal);