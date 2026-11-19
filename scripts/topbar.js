//@ts-check

/** @type {HTMLDivElement} */
const topbar = document.getElementById("topbar");

export class BarButton {
    /**
     * 
     * @param {string} name 
     * @param {function} clickedCallback
     * @param {function | null} rightClickedCallback
     */
    constructor(name, clickedCallback, rightClickedCallback = null) {
        /** @type {string} */
        this.name = name;
        /** @type {function} */
        this.callback = clickedCallback;
        /** @type {function | null} */
        this.rightClickedCallback = rightClickedCallback;

        let tmp = this.#createDiv();
        /** @type {HTMLDivElement} */
        this.button = tmp.div;
        /** @type {HTMLElement} */
        this.label = tmp.label;
        this.#registerEvents();

    }

    #registerEvents() {
        //left click
        this.button.addEventListener("click", (e) => {
            e.preventDefault();
            this.callback();
        });
        //right click
        this.button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.rightClickedCallback != null) {
                this.rightClickedCallback();
            }
        });
    }
    #createDiv() {
        let dv = document.createElement("div");
        dv.classList.add("app-text");
        topbar.appendChild(dv);

        let lbl = document.createElement("span");
        dv.appendChild(lbl);
        lbl.innerText = this.name;


        return { div: dv, label: lbl };
    }

    destroy() {
        this.button.remove();
    }
}