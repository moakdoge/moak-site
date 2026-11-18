// @ts-check

/** @type {Record<string, () => Promise<string>>} */
let stringVariables = {};

/** @type {Record<string, string>} */
let cachedMessages = {};

/**
 * @param {string} content
 * @param {boolean} mobileUser
 * @returns {Promise<string>}
 */
async function _formatString(content, mobileUser=false) {
    /** @type {string[]}*/
    const asciiArtBlocks = [];
    const asciiArtToken = (/** @type {number} */ index) => `@@ASCII_ART_BLOCK_${index}@@`;
    const escapeHtml = (/** @type {string} */ value) => value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    if (mobileUser) {
        content = content
            .replace(/(?:^|\r?\n|\\n)[ \t]*;\{[^}]*\}[ \t]*(?=\r?\n|\\n|$)/g, "")
            // 2. Remove any remaining inline ;{...} blocks
            .replace(/;\{[^}]*\}/g, "")
            // 3. Clean up leading newlines if the removed block was at the start
            .replace(/^(?:\r?\n|\\n)+/, "");
    } else {
        content = content.replace(/;\{([\s\S]*?)\}/g, (
            /** @type {string} */ _match,
            /** @type {string} */ block
        ) => {
            const index = asciiArtBlocks.length;
            asciiArtBlocks.push(block);
            return asciiArtToken(index);
        });
    }

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

    for (let name in stringVariables) {
        let callback = stringVariables[name];
        let replacement = String(await callback());
        content = content.replaceAll(`%${name}`, replacement);
    }

    for (let index = 0; index < asciiArtBlocks.length; index++) {
        const token = asciiArtToken(index);
        const block = `<span class="ascii-art">${escapeHtml(asciiArtBlocks[index])}</span>`;
        content = content.replaceAll(token, () => block);
    }

    if (mobileUser) {
        content = content.replace(/(?:<br\s*\/?>|\r?\n|\\n|\s)+$/gi, "");
    }
    return content;
}
 
/**
 * @param {string} content
 * @param {boolean} mobileUser
 * @returns {Promise<string>}
 */
export async function formatString(content, mobileUser=false) {
    return await _formatString(content, mobileUser);
}

/**
 * @param {string} name
 * @param {() => string | number | Promise<string | number>} callback
 */
export function registerStringVariable(name, callback) {
    stringVariables[name] = async () => String(await callback());
}


/**
 * 
 * @param {string} messageId
 * @returns {Promise<string>}
 */
export async function loadMessage(messageId) {
    if (cachedMessages[messageId] !== undefined) {
        return cachedMessages[messageId];
    }
    const response = await fetch(`/messages/${messageId}.txt`);
    const text = await response.text();
    cachedMessages[messageId] = text;
    return text;
}
/**
 * Splits input into tokens while preserving quoted arguments.
 * @param {string} raw - The raw input command string.
 * @returns {Promise<string[]>} An array of parsed arguments.
 */
export async function processCommandInput(raw) {
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
