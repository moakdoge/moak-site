/* purely used for the easter egg lol */

const konamiCode = [
    "arrowup", "arrowup", "arrowdown", "arrowdown",
    "arrowleft", "arrowright", "arrowleft", "arrowright",
    "b", "a", "start"
];
let konamiProgress = 0;
let rainbowEnabled = false;
let rainbowProgress = 0;
let oldValue = null;

function toggleRainbow() {
    rainbowEnabled=!rainbowEnabled;
    if (rainbowEnabled) {
        oldValue = document.documentElement.style.getPropertyValue("--text-color");
    }else {
        document.documentElement.style.setProperty("--text-color", oldValue);
    }
}
document.addEventListener("keydown", (event) => {
    const key = event.key === "Enter" ? "start" : event.key.toLowerCase();

    if (key === konamiCode[konamiProgress]) {
        konamiProgress++;
    } else {
        konamiProgress = key === konamiCode[0] ? 1 : 0;
    }

    if (konamiProgress === konamiCode.length) {
        toggleRainbow();
        konamiProgress = 0;
    }
});


async function rainbow(params) {
    if (!rainbowEnabled) {

        return;
    }
    rainbowProgress += 0.25;
    let hsvStr = `hsl(${Math.floor(rainbowProgress)}, 50%, 50%)`;
    if (rainbowProgress > 359) {
        rainbowProgress = 0;
    }
    document.documentElement.style.setProperty("--text-color", hsvStr);

}

setInterval(rainbow, 0.1);