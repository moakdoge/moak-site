//@ts-check
import * as strutils from "./strings.js"
export class ConsoleObject {
    /** 
     * @param {HTMLDivElement} logElement 
     * @param {HTMLTextAreaElement} inputPrompt *
     * @param {HTMLDivElement} windowElement
     * @param {Boolean} mobileUser
    * @param {HTMLElement} inputPromptText
    * @param {HTMLTextAreaElement} commandInput
    * @param {(rawInput: string) => (void|Promise<void>)} onEnter
    */
    constructor(logElement, inputPrompt, windowElement, mobileUser, inputPromptText, commandInput, onEnter) {
        /** @type {string[]} */
        this.logs = [];
        /** @type {HTMLDivElement} */
        this.logElement = logElement;
        /** @type {HTMLTextAreaElement} */
        this.inputElement = inputPrompt;
        /** @type {HTMLDivElement} */
        this.windowElement = windowElement;
        /** @type {Boolean} */
        this.mobileUser =  mobileUser;
        /** @type {HTMLElement} */
        this.promptTextElement = inputPromptText;
        /** @type {HTMLTextAreaElement} */
        this.commandInput = commandInput;
        /** @type {string[]} */
        this.commandHistory = [];
        /** @type {number} */
        this.cursor = 0;
        /** @type {(rawInput: string) => (void|Promise<void>)} */
        this.onEnter = onEnter;

        this.commandInput.addEventListener("input", async () => {
            await this.#resizeCommandInput();
        });
        this.commandInput.addEventListener("keydown", async (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                const rawInput = this.commandInput.value;
                await this.prompt(rawInput);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                this.cursor++;
                await this.initPrompt();
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                this.cursor--;
                await this.initPrompt();
            } else if (event.key === "Tab") {
                event.preventDefault();
            }
        });
    }

    /**
     * @param {string} content
     * @param {Boolean} raw
     */        
    #createLogObject(content, raw=false) {
        let fixed_content = content;
        this.logs.push(content);
        let mainDiv = document.createElement("div");
        mainDiv.className = "log";
        let contentItem = document.createElement("span");
        contentItem.className = "content";
        if (raw) {
            contentItem.textContent = fixed_content;
            contentItem.style.whiteSpace = "pre-wrap";
        } else {
            contentItem.innerHTML = fixed_content;
        }

        mainDiv.appendChild(contentItem);
        this.logElement.insertBefore(mainDiv, this.inputElement);
    }

    /** @param {string} content */
    async #printPrompt(content=""){
        let combined = `&&${await this.getPrompt()}${content || this.commandInput.value}&&`;
        await this.#printRaw(combined);
    }


    /** @param {string} content  */
    async #printRaw(content) {
        const formattedContent = await strutils.formatString(content);
        this.#createLogObject(formattedContent);
    }

    /** @param {string} content */
    async print(content) {
       await this.#printRaw(content);
    }

    /** @param {string} content */
    async error(content) {
        const error = content;
        const combined = `<span style="color: red;">${error}</span>`;
        await this.#printRaw(combined);
    }

    /** 
     * @param {string} subfill
     * @param {string} error
     */

    async raise(subfill, error) {
        await this.error(error.replaceAll("%s", subfill));
    }
    async clear() {
        for (let i = this.logElement.children.length - 1; i >= 0; i--) {
            let child = this.logElement.children[i];
            if (child !== this.inputElement) {
                this.logElement.removeChild(child);
            }
        }

    }

    async resizeLog() {
        if (!this.mobileUser) {
            return;
        }
        let height = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight; 
    
    
        let pxHeight = height * 0.95;
        this.windowElement.style.height =`${Math.floor(pxHeight)}px`;
        const viewportOffset = window.visualViewport?.offsetTop ?? 0;
        this.windowElement.style.top = `${Math.floor(viewportOffset + height / 2)}px`;
    };

    async #resizeCommandInput() {
        this.commandInput.style.width = Math.max(this.commandInput.value.length, 1) + "ch";
        await this.resizeLog();
        await this.toBottom();
    }
    
    async toBottom() {
        requestAnimationFrame(() => {
            this.logElement.scrollTop = this.logElement.scrollHeight;
        });
    }

    /** @returns {Promise<string>} */
    async getPrompt() {
        return "unknown";
    }
    async clearPrompt() {
        //For now, this'll just handle the equivalent of an enter
        await this.resizeLog();
        let command = this.commandInput.value.trim();
        let combined = `&&${await this.getPrompt() + command}&&`;
        await this.#printRaw(combined);
    }
    async initPrompt() {
        this.promptTextElement.textContent = await this.getPrompt();
        this.commandInput.value = "";
        if (this.cursor != 0 && this.cursor <= this.commandHistory.length) {
            let val = this.commandHistory[this.commandHistory.length - this.cursor];
            if (val == undefined) {
                this.cursor = this.commandHistory.length - 1;
                val = "";
            }
            this.commandInput.value = val
        } else {
            this.cursor = 0;
        }
        await this.#resizeCommandInput();
        await this.toBottom();
    }

    /** @param {string} content */
    async prompt(content) {
        await this.#printPrompt();
        this.commandHistory.push(content);
        this.cursor = 0;
        await this.onEnter(content);
        await this.initPrompt();
    }
}




/** @type {ConsoleObject} */
export let terminal;

/**
 * @param {HTMLDivElement} logElement
 * @param {HTMLTextAreaElement} inputPrompt
 * @param {HTMLDivElement} windowElement
 * @param {Boolean} mobileUser
 * @param {HTMLElement} inputPromptText
 * @param {HTMLTextAreaElement} commandInput
 * @param {(rawInput: string) => (void|Promise<void>)} onEnter
 * @returns {ConsoleObject}
 */
export function initializeTerminal(
    logElement,
    inputPrompt,
    windowElement,
    mobileUser,
    inputPromptText,
    commandInput,
    onEnter
) {
    terminal = new ConsoleObject(
        logElement,
        inputPrompt,
        windowElement,
        mobileUser,
        inputPromptText,
        commandInput,
        onEnter
    );
    return terminal;
}