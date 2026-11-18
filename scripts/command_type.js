export class MainCommand {
    /**
     * Command object.
     * @param {string} author 
     * @param {(items: string[]) => void | Promise<void>} callback
     * @param {string} description
     * @param {boolean} [hidden=false] 
     * @param {string} name  
     */
    constructor(name, description, author, callback, hidden) {
        this.name = name;
        this.description = description;
        this.author = author;
        this.callback = callback;
        this.hidden = hidden;
        /* @type {string[]} */
        this.aliases = []
    }

    toString() {
        return `${this.name}: (hidden: ${this.hidden ? "yes" : "no"}, description="${this.description}", author="${this.author}", aliases=${this.aliases})`;
    }
}