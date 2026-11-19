import { CommandManager } from "./commands.js";
import { ConsoleObject } from "./console.js";

//@ts-check
export class CommandContext {
    /**
     * 
     * @param {string} command 
     * @param {string[]} args 
     * @param {ConsoleObject} terminal 
     * @param {CommandManager} manager 
     */
    constructor (command, args, terminal, manager) {
        /** @type {string} */
        this.command = command;
        /** @type {string[]} */
        this.args = args;
        /** @type {ConsoleObject} */
        this.terminal = terminal;
        /** @type {CommandManager} */
        this.manager = manager;
    }
}