const terminalLog = document.getElementById("term-log");
const inputPrompt = document.getElementById("input-prompt");
const inputPromptText = document.getElementById("prompt-text");
const commandInput = document.getElementById("command-input");
const mainBody = document.getElementById("main-body");
/** @type {string: string} */
const exceptions = {
    notFound: "Command %s is not found."
}
/** @type {MainCommand[]} */
let commands = [];
/** @type {string[]} */
let commandHistory = [];
let cursor = 0;

class MainCommand {
    constructor(name, description, author, callback) {
        this.name = name;
        this.description = description;
        this.author = author;
        this.callback = callback;
        commands.push(this);
    }
}

function registerCommand(name, description, author, callback) {
    new MainCommand(name, description, author, callback);
    
}
function getPrompt() {
    const username = "you";
    const hostname = "moakdoge.dev";
    return username + "@" + hostname + " >  ";
}

function clearLog() {
    for (let i = terminalLog.children.length - 1; i >= 0; i--) {
        let child = terminalLog.children[i];
        if (child !== inputPrompt) {
            terminalLog.removeChild(child);
        }
    }
}

function printToLog(content) {
    let mainDiv = document.createElement("div");
    mainDiv.className = "log";
    let contentItem = document.createElement("span");
    contentItem.className = "content";
    contentItem.innerHTML = content
        .replace(/`([^`]+)`/g, '<span class="command-text">$1</span>')
        .replace(
            /\[([^\]]+)\]\(([^)\s]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        )
        .replace(/\\n|\r?\n/g, "<br>");
    mainDiv.appendChild(contentItem);
    terminalLog.insertBefore(mainDiv, inputPrompt);
}

function initPrompt() {
    inputPromptText.textContent = getPrompt();
    commandInput.value = "";
    if (cursor != 0 && cursor <= commandHistory.length) {
        commandInput.value = commandHistory[commandHistory.length - cursor];
    } else {
        cursor = 0;
    }
    resizeCommandInput();
}

function resizeCommandInput() {
    commandInput.style.width = Math.max(commandInput.value.length, 1) + "ch";
}
/**
 * Splits input into tokens while preserving quoted arguments.
 * @param {string} raw - The raw input command string.
 * @returns {string[]} An array of parsed arguments.
 */
function processCommandInput(raw) {
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
function findCommand(name) {
    for (let i = 0; i < commands.length; i++) {
        let command = commands[i];
        if (command.name == name) {
            return command;
        }
    }
}
/** 
  *  @param {string[]} args
  *  @return {bool} success (true if succeeded; otherwise false)
*/
function runCommand(args) {
    let commandName = args[0];
    let found = findCommand(commandName);
    commandHistory.push(args.join(" "));
    if (found) {
        found.callback(args);
        cursor = 0;
        return true;
    }
    return false;
}

function raiseError(command, message) {
    const error = message.replace("%s", command);
    const combined = `<span style="color: red;">${error}</span>`;
    printToLog(combined);
}
function submitPrompt() {
    //For now, this'll just handle the equivalent of an enter
    let command = commandInput.value;
    console.log(command);
    let combined = getPrompt() + command;
    printToLog(combined);
    let parts = processCommandInput(command);
    let success = runCommand(parts);
    if (!success) {
        raiseError(parts[0], exceptions.notFound);
    }

    initPrompt();
}

initPrompt();

commandInput.addEventListener('input', resizeCommandInput);

inputPrompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        submitPrompt();
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        cursor++;
        initPrompt();
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        cursor--;
        initPrompt();
    }
});

mainBody.addEventListener("click", (e) => {
    commandInput.focus();
})

document.addEventListener('click', (e) => {
    const cmdElement = e.target.closest('.command-text');
    if (cmdElement) {
        console.log(cmdElement.textContent)
        commandInput.value = cmdElement.textContent;
        resizeCommandInput();
        submitPrompt();
    }
})