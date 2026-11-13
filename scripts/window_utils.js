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


async function showImage(title, image) {
    let win = await createWindow(20, 20, title);
    let imag = document.createElement("img");
    imag.src = image;
    imag.style.maxWidth = "100%";
    imag.style.height = "auto";
    imag.style.alignSelf = "center";
    imag.style.justifySelf = "flex-start";
    
    win.appendChild(imag);

}