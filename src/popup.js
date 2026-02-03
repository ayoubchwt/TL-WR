document.getElementById("pick-button").addEventListener("click", async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    await browser.tabs.sendMessage(tabs[0].id, { type: "START_PICKING" });
    window.close();
});
document.getElementById("fetch-button").addEventListener("click", async () => {
    const output = document.getElementById("output");
    output.innerText = "Loading...";

    try {

        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];

        const response = await browser.tabs.sendMessage(currentTab.id, { type: "GET_POST" });

        if (!response || (!response.title && !response.body)) {
            output.innerText = "No post selected yet.\n\nGo to the page and click on a post (it should flash orange)!";
            return;
        }
        const summary = await summarize(response.title, response.body);
        output.innerText = summary;
    } catch (error) {
        console.error(error);
        output.innerText = "Error: Please refresh the Reddit page and try again.";
    }
});
async function summarize(title, body) {

    const workerUrl = "https://mute-grass-72e5.alhwyt237.workers.dev/";
    const mySecret = "this-password-is-to-prevent-bots-from-spamming-this";

    const response = await fetch(workerUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": mySecret
        },
        body: JSON.stringify({
            title: title,
            body: body
        })
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}