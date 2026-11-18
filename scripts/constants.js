import { fileManager } from "./file_system.js";
let username = "root";
let hostname = "moakdoge.dev";


const startupTime = new Date();
export async function getStartupTime() {
    return startupTime;
}

export async function getPrompt() {
    let prompt = `${getUsername()}@${getHostname()}`
    let path = await fileManager.getDirectory();
    let final = `${prompt} (${path}) ❯ `
    return final;
}

let mobileUser = window.innerWidth < 720;
export const getUsername = () => username;
export const getHostname = () => hostname;
export const getMobile = () => mobileUser;

export function setHostname(host) {
    if (hostname != host) {
      setCookie("hostname", host);
    }
    hostname = host;
}
export function setUsername(user) {
      if (username != user) {
      setCookie("username", user);
    }
    username = user;
}


export const birthday = new Date("2010-03-17T15:00:04.000Z");
/**
 * Sets a browser cookie with automatic URL encoding.
 *
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value to store (will be URI-encoded).
 * @param {Object} [options={}] - Optional cookie attributes.
 * @param {number} [options.days] - Expiration in days from now.
 * @param {string} [options.path='/'] - Cookie path.
 * @param {string} [options.domain] - Cookie domain.
 * @param {boolean} [options.secure=true] - Transmit only over HTTPS.
 * @param {'Strict'|'Lax'|'None'} [options.sameSite='Lax'] - SameSite policy.
 */
export function setCookie(name, value, options = {}) {
  const {
    days,
    path = '/',
    domain,
    secure = window.location.protocol === 'https:',
    sameSite = 'Lax',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (typeof days === 'number') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    cookieString += `; expires=${expires}`;
  }

  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (sameSite) cookieString += `; SameSite=${sameSite}`;
  if (secure) cookieString += '; Secure';

  document.cookie = cookieString;
}

/**
 * Retrieves and URL-decodes a browser cookie by name.
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @param {*} [defaultValue=null] - Fallback value if the cookie does not exist.
 * @returns {string|*} The decoded cookie value, or defaultValue if not found.
 */
export function getCookie(name, defaultValue = null) {
  const encodedName = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    if (cookie.startsWith(encodedName)) {
      const rawValue = cookie.slice(encodedName.length);
      return decodeURIComponent(rawValue);
    }
  }

  return defaultValue;
}

setUsername(getCookie("username", username));
setHostname(getCookie("hostname", hostname));

addEventListener("resize", function (e) {
  mobileUser = window.innerWidth < 720;
})