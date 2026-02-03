let latestPostData = null;
let isPickingMode = false;
let currentHighlighter = null;

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "GET_POST") {
        return Promise.resolve(latestPostData);
    }

    if (message.type === "START_PICKING") {
        enablePickerMode();
    }
});

function enablePickerMode() {
    if (isPickingMode) return;
    isPickingMode = true;

    document.body.style.cursor = "crosshair";

    document.addEventListener("mouseover", handleHover);
    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("keydown", handleEscape);
}

function disablePickerMode() {
    isPickingMode = false;
    document.body.style.cursor = "default";

    document.removeEventListener("mouseover", handleHover);
    document.removeEventListener("click", handleClick, { capture: true });
    document.removeEventListener("keydown", handleEscape);

    if (currentHighlighter) {
        currentHighlighter.style.outline = "";
        currentHighlighter = null;
    }
}

function handleHover(event) {
    if (currentHighlighter) {
        currentHighlighter.style.outline = "";
    }
    const postContainer = event.target.closest("shreddit-post");

    if (postContainer) {
        currentHighlighter = postContainer;
        currentHighlighter.style.outline = "4px solid #FF4500";
        currentHighlighter.style.cursor = "pointer";
    }
}

function handleClick(event) {
    if (!isPickingMode) return;

    const postContainer = event.target.closest("shreddit-post");
    if (postContainer) {
        event.preventDefault();
        event.stopPropagation();

        extractPostData(postContainer);

        postContainer.style.outline = "4px solid #46D160";
        setTimeout(() => postContainer.style.outline = "", 1500);

        disablePickerMode();
    }
}

function handleEscape(event) {
    if (event.key === "Escape") {
        disablePickerMode();
    }
}

function extractPostData(element) {
    const title = element.getAttribute("post-title") || "";
    let body = "";
    const bodyEl = element.querySelector("div[slot='text-body']");
    if (bodyEl) {
        body = Array.from(bodyEl.querySelectorAll("p"))
            .map(p => p.innerText.trim())
            .join("\n\n");
    }
    latestPostData = { title, body };
}