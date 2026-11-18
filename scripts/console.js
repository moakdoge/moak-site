//@ts-check
import * as strutils from "./strings.js"
export class ConsoleObject {
    /** 
     * @param {HTMLElement} logElement 
     * @param {HTMLElement} inputPrompt *
    */
    constructor(logElement, inputPrompt) {
        /** @type {string[]} */
        this.logs = [];
        /** @type {HTMLElement} */
        this.logElement = logElement;
        /** @type {HTMLElement} */
        this.inputElement = inputPrompt;
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

    /** @param {string} content  */
    async #printRaw(content) {
        const formattedContent = await strutils.formatString(content);
        this.#createLogObject(formattedContent);
    }
}

