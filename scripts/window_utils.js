const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function alertUser(title, message, blocking = false) {
    let onFinish;
    const closedPromise = new Promise((resolve) => {
        onFinish = () => {
            resolve(true);
            return true;
        };
    });

    let win = await createWindow(20, 20, title, onFinish);
    
    let msg = document.createElement("p");
    win.appendChild(msg);
    msg.classList.add("text");
    msg.innerText = message;

    if (!blocking) {
        return true;
    }

    return closedPromise;
}