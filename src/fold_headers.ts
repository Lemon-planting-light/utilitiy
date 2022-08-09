// ==UserScript==
// @name         Discourse Titles collapser
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Collapse the titles of discourse posts
// @author       Virginia Senioria
// @match        https://limelight.moe/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-idle
// ==/UserScript==



function foldHeaders(section: Element): HTMLCollection {
    const LvMap: Map<string, number> = (() => {
        let res = new Map();
        for (let i = 1; i <= 6; ++i) {
            res.set("H" + i, i);
        }
        return res;
    })();
    let res = document.createElement(section.tagName);
    let stack: [HTMLElement, HTMLElement, number][] = [];
    let cur: [HTMLElement, HTMLElement, number] = [res, document.createElement("div"), 0];
    cur[1].classList.add("section-content");
    cur[0].appendChild(cur[1]);
    for (let item of section.children) {
        item = item.cloneNode(true) as Element;
        // Is a header
        if (LvMap.has(item.tagName)) {
            let lv = LvMap.get(item.tagName);
            // Find an appropriate container for the new section
            while (lv <= cur[2]) {
                let last = cur[0];
                cur = stack.pop();
                cur[1].appendChild(last);
            }
            // Create new section for the header
            stack.push(cur);
            cur = [document.createElement("section"), document.createElement("div"), lv];
            cur[0].classList.add("titled-section");
            cur[1].classList.add("section-content");
            procHeader(item);
            cur[0].append(item, cur[1]);
        } else {
            cur[1].appendChild(item);
        }
    }
    while (stack.length > 0) {
        let last = cur[0];
        cur = stack.pop();
        cur[1].appendChild(last);
    }
    return res.children;
}

function procHeader(item: Element) {
    item.classList.add("section-title");
    let elem = document.createElement("button");
    elem.innerText = "fold";
    elem.addEventListener("click", function () {
        let section = this.parentElement.parentElement;
        // Folded: expand it
        if (section.classList.contains("folded")) {
            this.innerText = "fold";
        }
        else {
            this.innerText = "expand";
        }
        section.classList.toggle("folded");
    });
    item.append(" ", elem);
}



(function () {
    // Replace all children
    function replaceChild(par: HTMLElement) {
        for (let node of par.getElementsByClassName("cooked")) {
            node.replaceChildren(...foldHeaders(node));
        }
    }
    replaceChild(document.body);

    const bodyobserver = new MutationObserver(function (mutlist) {
        for (const mut of mutlist) {
            let classes = (mut.target as HTMLElement).classList;
            if (classes.contains('topic-post') || classes.contains('cloaked-post')) {
                replaceChild(mut.target as HTMLElement);
            }
        }
    });
    bodyobserver.observe(document.getElementsByClassName("post-stream")[0], {subtree: true, childList: true, });


    // Add styles for folding and expanding
    let styles = document.createElement("style");
    styles.innerText = `
.titled-section.folded::after {
    content: "...";
    display: block;
    background-color: rgba(220, 220, 220, 0.3);
    color: rgba(70, 70, 70, 0.76);
    padding: 0.5ch 0.8em;
}
.titled-section > .section-content {
    overflow: hidden;
    height: auto;
    transition: max-height 0.2s linear;
}
.titled-section.folded > .section-content {
    max-height: 0;
}
`;
    document.head.appendChild(styles);
})()

