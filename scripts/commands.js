//@ts-check
import { MainCommand } from "./command_type.js";
import * as strutils from "./strings.js";
import { ConsoleObject } from "./console.js";
import { CommandContext } from "./ctx.js";
export class CommandManager {
    /** 
     * Manages commands. Shocker.
     * @param {ConsoleObject} term 
     */
    constructor(term) {
        /** @type {MainCommand[]} */
        this.commands = []
        /** @type {ConsoleObject} */
        this.terminal = term;
    }

    /**
     * Registers a core command with a callback.
     * @param {string} author 
     * @param {(ctx: CommandContext) => void | Promise<void>} callback
     * @param {string} description
     * @param {boolean} [hidden=false] 
     * @param {string} name  
        *
     }} callback 
     */
    async register(name, description, author, callback, hidden = false) {
        let tmpCommand = new MainCommand(name, description, author, callback, hidden);
        this.commands.push(tmpCommand);
    }

    /**
     * Registers a pure text command. Useful for joke commands.
     * @param {string} content
     * @param {string} name 
     * @param {boolean} [hidden=true] 
     * @param {string} [author="N/A"] 
     * @param {string} [description="We don't know..."] 
     */
    async registerText(name, content, hidden = true, description = "We don't know...", author = "N/A") {
        if (content.startsWith("$message")) {
            content = String(content).replace("$message", "");
            content = content.trim();

            content = await strutils.loadMessage(content);
        }
        let term = this.terminal
        
        /** @param {CommandManager} ctx */
        async function callback(ctx) {
            await ctx.terminal.print(content);
        }
        let tmpCommand = new MainCommand(name, description, author, callback, hidden);
        this.commands.push(tmpCommand);
    }

    /**
     * 
     * @param {string} cmd
     * @return {Promise<MainCommand | null>}
     */
    async find(cmd) {
        for (let i = 0; i < this.commands.length; i++) {
            let command = this.commands[i];
            if (command.name == cmd) {
                return command;
            }
            if (command.aliases.includes(cmd)) {
                return command;
            }
        }
        return null;
    }
    /**
     * Creates an alias for a certain command.
     * @param {string} alias 
     * @param {string} command 
     */
    async createAlias(alias, command) {
        let found = await this.find(command);
        if (found) {
            found.aliases.push(alias);
        }
    }


    /** 
      *  @param {string[]} args
      *  @param {Boolean} [addToHistory=true]
      *  @returns {Promise<boolean>}
    */
    async #run(args, addToHistory = true) {
        let commandName = args[0];
        if (addToHistory) {
            this.terminal.commandHistory.push(args.join(" "));
        }
        let found = await this.find(commandName);
        if (found) {
            try {
                let ctx = new CommandContext(
                    commandName, args, this.terminal, this
                );
                await found.callback(ctx);
            } catch (c) {
                await this.terminal.raise(String(c), "Could not find command %s");
            }
            return true;
        }
        return false;
    }


    /**
     * 
     * @param {string} input 
     * @param {boolean} [addToHistory=true] 
     * @returns {Promise<boolean>}
     */
    async run(input, addToHistory = true) {
        let parts = await strutils.processCommandInput(input);
        return await this.#run(parts, addToHistory);
    }


}