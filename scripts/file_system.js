class FileManager {
    constructor() {
        this._fileSystem = null;
        this._current_dir = "/";
    }

    async init() {
        this._fileSystem = await this._parseFiles();
        this._current_dir = "/";
    }
    
    async _parseFiles() {
        let ans = await fetch("/fs-metadata.json")
        return await ans.json();
    }

    async getDirectory() {
        return this._current_dir;
    }

    async _getCurrentDirectory() {
        if (this._fileSystem === null) {
            return null;
        }

        let directory = this._fileSystem;
        const parts = this._current_dir.split("/").filter(Boolean);

        for (const part of parts) {
            if (!Array.isArray(directory.directories)) {
                return null;
            }

            directory = directory.directories.find(item => item.name === part);
            if (directory === undefined) {
                return null;
            }
        }

        return directory;
    }

    async fileExists(path) {
        if (typeof path !== "string" || path.length === 0 || this._fileSystem === null) {
            return false;
        }

        const pathParts = path.split("/");
        const fileName = pathParts.pop();
        if (fileName === "" || fileName === "." || fileName === "..") {
            return false;
        }

        const currentParts = this._current_dir.split("/").filter(Boolean);
        const targetParts = path.startsWith("/") ? [] : [...currentParts];

        for (const part of pathParts) {
            if (part === "" || part === ".") {
                continue;
            }
            if (part === "..") {
                if (targetParts.length === 0) {
                    return false;
                }
                targetParts.pop();
                continue;
            }
            targetParts.push(part);
        }

        let directory = this._fileSystem;
        for (const part of targetParts) {
            if (!Array.isArray(directory.directories)) {
                return false;
            }

            directory = directory.directories.find(item => item.name === part);
            if (directory === undefined) {
                return false;
            }
        }

        return Array.isArray(directory.files)
            && directory.files.some(file => file.name === fileName);
    }
    async readFile(path) {
        if (!(await this.fileExists(path))) {
            return null;
        }

        const pathParts = path.split("/");
        const fileName = pathParts.pop();
        const currentParts = this._current_dir.split("/").filter(Boolean);
        const targetParts = path.startsWith("/") ? [] : [...currentParts];

        for (const part of pathParts) {
            if (part === "" || part === ".") {
                continue;
            }
            if (part === "..") {
                targetParts.pop();
                continue;
            }
            targetParts.push(part);
        }

        targetParts.push(fileName);
        const response = await fetch("/" + targetParts.join("/"));
        if (!response.ok) {
            return null;
        }

        return await response.text();
    }

    /** @param {string} path */
    async setDirectory(path) {
        if (typeof path !== "string" || path.length === 0 || this._fileSystem === null) {
            return false;
        }

        const currentParts = this._current_dir.split("/").filter(Boolean);
        const targetParts = path.startsWith("/") ? [] : [...currentParts];

        for (const part of path.split("/")) {
            if (part === "" || part === ".") {
                continue;
            }
            if (part === "..") {
                if (targetParts.length === 0) {
                    return false;
                }
                targetParts.pop();
                continue;
            }
            targetParts.push(part);
        }

        let directory = this._fileSystem;
        for (const part of targetParts) {
            const child = directory.directories.find(item => item.name === part);
            if (child === undefined) {
                return false;
            }
            directory = child;
        }

        this._current_dir = "/" + targetParts.join("/");
        return true;
    }
}



/** @type {FileManager} */
let fileManager = null;
(async function (){
    fileManager = new FileManager();
    await fileManager.init();
})();