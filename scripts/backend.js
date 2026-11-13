const terminalLog = document.getElementById("term-log");
const inputPrompt = document.getElementById("input-prompt");
const inputPromptText = document.getElementById("prompt-text");
const commandInput = document.getElementById("command-input");
const mainBody = document.getElementById("main-body");
const birthday = new Date("2010-03-17T15:00:04.000Z");
const startupTime = new Date();
const mobileUser = window.innerWidth < 640;


async function getStartupTime() {
    return startupTime;
}

/** @type {string: string} */
const exceptions = {
    notFound: "Command %s is not found."
}
/** @type {MainCommand[]} */
let commands = [];
/** @type {string[]} */
let commandHistory = [];
let cursor = 0;
let username = "root";
let hostname = "moakdoge.dev";

let windowElements = [];

/** @type {string: string} */
let cached_messages = {}


/** @type {string: async function} */
let string_variables = {}

class MainCommand {
    constructor(name, description, author, callback, hidden) {
        this.name = name;
        this.description = description;
        this.author = author;
        this.callback = callback;
        this.hidden = hidden;
        /* @type {string[]} */
        this.aliases = []
        commands.push(this);
    }

    toString() {
        return `${this.name}: (hidden: ${this.hidden ? "yes" : "no"}, description="${this.description}", author="${this.author}")`
    }
}

async function registerCommand(name, description, author, callback, hidden = false) {
    new MainCommand(name, description, author, callback, hidden);
}

/** @param {string | callback} callback */
async function registerStringVariable(name, callback) {
    if (typeof (callback) == String) {
        async function _() {
            return callback;
        }
        callback = _;
    }
    string_variables[name] = callback
}
async function registerStupidCommand(name, error, hidden = true, description = "We don't know...", author = "N/A") {
    if (error.startsWith("$message")) {
        error = String(error).replace("$message", "");
        error = error.trim();

        error = await loadMessage(error);
    }
    async function callback() {
        await printToLog(error);
    }
    new MainCommand(name, description, author, callback, hidden);
}
async function getPrompt() {
    let prompt = `${username}@${hostname}`
    let path = await fileManager.getDirectory();
    let final =`${prompt} (${path}) ❯ `
    return final;
}

async function clearLog() {
    for (let i = terminalLog.children.length - 1; i >= 0; i--) {
        let child = terminalLog.children[i];
        if (child !== inputPrompt) {
            terminalLog.removeChild(child);
        }
    }
}


async function loadMessage(message_id) {
    if (cached_messages[message_id] != undefined) {
        return cached_messages[message_id];
    }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/messages/${message_id}.txt`, false); // false = synchronous
    xhr.send(null);
    let ans = xhr.response;
    cached_messages[message_id] = ans;
    return ans;
}

async function aliasCommand(new_inp, old) {
    let found = await findCommand(old);
    if (found) {
        found.aliases.push(new_inp);
    }
}

/** @param {string} content */
async function formatContent(content) {
    const asciiArtBlocks = [];
    const asciiArtToken = (index) => `@@ASCII_ART_BLOCK_${index}@@`;
    const escapeHtml = (value) => value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    content = content.replace(/;\{([\s\S]*?)\}/g, (match, block) => {
        const index = asciiArtBlocks.length;
        asciiArtBlocks.push(block);
        return asciiArtToken(index);
    });

    const disableFormattingMarker = "--disable-text-formatting--";
    const disableFormatting = content.includes(disableFormattingMarker);

    if (!disableFormatting) {
        content = content
            .replace(/(^|\r?\n)### (.+?)(?=\r?\n|$)/gm, "$1<h3>$2</h3>")
            .replace(/(^|\r?\n)## (.+?)(?=\r?\n|$)/gm, "$1<h2>$2</h2>")
            .replace(/(^|\r?\n)# (.+?)(?=\r?\n|$)/gm, "$1<h1>$2</h1>")
            .replace(/(^|\r?\n)-# (.+?)(?=\r?\n|$)/gm, "$1<small>$2</small>")
            .replace(/__(.+?)__/g, '<u>$1</u>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/~~(.+?)~~/g, '<del>$1</del>')
            .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
            .replace(/\|([^|]+)\|/g, '<a href="#" class="command-text command-link" data-command="$1">$1</a>')
            .replace(/&&([^&]+)&&/g, '<span class="colored-text">$1</span>')
            .replace(/`([^`]+)`/g, '<span class="command-text">$1</span>')
            .replace(
                /\[([^\]]+)\]\(([^)\s]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
            )
            .replace(/\\n|\r?\n/g, "<br>");
    } else {
        content = content.replace(disableFormattingMarker, "");
    }
    for (let name in string_variables) {
        let callback = string_variables[name];
        let replacement = String(await callback());
        content = content.replaceAll(`%${name}`, replacement);
    }

    for (let index = 0; index < asciiArtBlocks.length; index++) {
        const token = asciiArtToken(index);
        const block = `<span class="ascii-art">${escapeHtml(asciiArtBlocks[index])}</span>`;
        content = content.replaceAll(token, () => block);
    }

    return content;
}
async function printToLog(content) {
    let fixed_content = await formatContent(content)
    let mainDiv = document.createElement("div");
    mainDiv.className = "log";
    let contentItem = document.createElement("span");
    contentItem.className = "content";
    contentItem.innerHTML = fixed_content


    mainDiv.appendChild(contentItem);
    terminalLog.insertBefore(mainDiv, inputPrompt);
    await scrollToBottom();
}

async function initPrompt() {
    inputPromptText.textContent = await getPrompt();
    commandInput.value = "";
    if (cursor != 0 && cursor <= commandHistory.length) {
        let val = commandHistory[commandHistory.length - cursor];
        if (val == undefined) {
            cursor = commandHistory.length - 1;
            val = "";
        }
        commandInput.value = val
    } else {
        cursor = 0;
    }
    await resizeCommandInput();
}

async function scrollToBottom() {
    requestAnimationFrame(() => {
        terminalLog.scrollTop = terminalLog.scrollHeight;
    });
}

async function _resizeLog() {
    console.log("resize, mobile user:", mobileUser);
    if (!mobileUser) {
        return;
    }
    let height = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight; 

    if (window.customHeight) {
        height = window.customHeight;
        console.log(customHeight);
    }

    let pxHeight = height*0.9;
    windowElement.style.height =`${Math.floor(pxHeight)}px`;
    if (height != window.innerHeight) {
        windowElement.style.top = `${Math.floor(pxHeight)}px`;
    }else{
        windowElement.style.top = `50%`;
    }

}

async function resizeCommandInput() {

    commandInput.style.width = Math.max(commandInput.value.length, 1) + "ch";
    await _resizeLog();
    await scrollToBottom();
}
/**
 * Splits input into tokens while preserving quoted arguments.
 * @param {string} raw - The raw input command string.
 * @returns {string[]} An array of parsed arguments.
 */
async function processCommandInput(raw) {
    const regex = /"[^"]*"|'[^']*'|\S+/g;
    const matches = raw.match(regex) || [];

    // Strip outer quotes from each token
    return matches.map(token => {
        if (
            (token.startsWith('"') && token.endsWith('"')) ||
            (token.startsWith("'") && token.endsWith("'"))
        ) {
            return token.slice(1, -1);
        }
        return token;
    });
}

/**
 * 
 * @param {string} name 
 * @returns {MainCommand?}
 */
async function findCommand(name) {
    for (let i = 0; i < commands.length; i++) {
        let command = commands[i];
        if (command.name == name) {
            return command;
        }
        if (command.aliases.includes(name)) {
            return command;
        }
    }
}
/** 
  *  @param {string[]} args
  *  @param {bool} addToHistory = true
  *  @return {bool} success (true if succeeded; otherwise false)
*/
async function runCommand(args, addToHistory = true) {
    let commandName = args[0];
    let found = await findCommand(commandName);
    if (addToHistory) {
        commandHistory.push(args.join(" "));
    }
    if (found) {
        await found.callback(args);
        cursor = 0;
        await scrollToBottom();
        return true;
    }
    await scrollToBottom();
    return false;
}

async function raiseError(command, message) {
    const error = message.replace("%s", command);
    const combined = `<span style="color: red;">${error}</span>`;
    await printToLog(combined);
}
async function submitPrompt() {
    //For now, this'll just handle the equivalent of an enter
    await _resizeLog();
    let command = commandInput.value.trim();
    let combined = `&&${await getPrompt() + command}&&`;
    await printToLog(combined);
    let parts = await processCommandInput(command);
    let success = await runCommand(parts);
    if (!success) {
        await raiseError(parts[0], exceptions.notFound);
    }

    await initPrompt();
    await scrollToBottom();
}

initPrompt();

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

commandInput.addEventListener('input', async () => await resizeCommandInput());

inputPrompt.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        await submitPrompt();
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        cursor++;
        await initPrompt();
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        cursor--;
        await initPrompt();
    }

    if (e.key == "Tab") {
        e.preventDefault();
    }
});

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
        await _resizeLog();
        await resizeCommandInput();
        await submitPrompt();
    }
})


const windowElement = document.getElementById("window");
const found = document.querySelector(".title-bar");
const foundB = document.querySelector(".close-button");
const win = registerWindow(windowElement, found, foundB, () => {
    alertUser("System", "Why would you try to close this? ")
    return false;
});



(async function (){
    if (mobileUser) {
        windowElement.style.width = "90%";
        windowElement.style.height = "90%";
        document.documentElement.style.setProperty('--mobile-visible', 'none');
        console.log("mobile");
    }
})();
