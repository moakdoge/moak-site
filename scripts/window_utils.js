import { getMobile } from "./constants.js";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export let windowElements = [];
const mainBody = document.getElementById("main-body");
export async function createWindow(w="fit-content", h="fit-content", title, closeCallback) {
    const newElement = document.createElement("div");
    newElement.className = "window";
    newElement.style.zIndex = 999;
    newElement.style.width = `${String(w)}%`;
    if (w == "fit-content") {
        newElement.style.width = w;
    }
    newElement.style.height = `${String(h)}%`;
    if (h == "fit-content") {
        newElement.style.height = h;
    }

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




export function registerWindow(windowElement, titleBar, closeButton, closeCallback) {
    let dragOffset = null;

    windowElements.push(windowElement);
    titleBar.addEventListener("pointerdown", (e) => {
        if (!getMobile()) {
            windowElement.style.zIndex = 1;
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
        windowElement.style.zIndex = 2;
        windowElement.classList.add("focused");
        windowElement.classList.remove("unfocused")
        for (const otherWindow of windowElements) {
            if (otherWindow === windowElement) {
                continue;
            }
            otherWindow.classList.remove("focused");
            otherWindow.classList.add("unfocused");
            otherWindow.zIndex = 0;
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
        let doClose = true;
        if (closeCallback != undefined && closeCallback != null) {
            try {
                doClose = closeCallback();
            } catch (c) {
                console.error(c);
                doClose = false;
            }
            if (!doClose) {
                return;
            }
        }

        if (doClose) {
            const windowIndex = windowElements.indexOf(windowElement);
            if (windowIndex !== -1) {
                windowElements.splice(windowIndex, 1);
            }

            windowElement.remove();
            if (windowElements.length > 0) {
                windowElements[0]._focus();
            }
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
export async function alertUser(title, message, blocking = false) {
    let onFinish;
    const closedPromise = new Promise((resolve) => {
        onFinish = () => {
            resolve(true);
            return true;
        };
    });

    let w = 40;
    let h = 20;
    if (getMobile()) {
        w = 70;
        h = 20;
    }
    let win = await createWindow(w, h, title, onFinish);
    
    let msg = document.createElement("p");
    win.appendChild(msg);
    msg.classList.add("text");
    msg.innerHTML = message;

    if (!blocking) {
        return true;
    }

    return closedPromise;
}


export async function showImage(title, image) {
    let win = await createWindow("fit-content", "fit-content", title);
    let imag = document.createElement("img");
    imag.src = image;
    imag.style.maxWidth = "80%";
    imag.style.width = "fit-content";
    imag.style.height = "fit-content";
    imag.style.alignSelf = "center";
    imag.style.justifySelf = "flex-start";
    
    win.appendChild(imag);

}