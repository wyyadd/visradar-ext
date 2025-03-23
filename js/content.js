(async function () {
    await chrome.storage.local.get().then(items => {
        document.getElementById("activate").checked = items["__ap"];
        document.getElementById("autobook").checked = items["__ab"];
        document.getElementById("frequency").value = items["__fq"] || 60;
        document.getElementById("checkfrequency").innerText = items["__fq"] || 60;
        document.getElementById("start").value = items["__st"] || new Date().toISOString().split('T')[0];
        document.getElementById("end").value = items["__en"] || "";
    })

    chrome.storage.onChanged.addListener(async (changes, area) => {
        if (changes.__fq)
            document.getElementById("checkfrequency").innerText = changes.__fq.newValue;
        if (changes.__st) {
            let __st = changes.__st.newValue;
            if (!__st) __st = new Date().toISOString().split('T')[0];
            document.getElementById("start").value = __st;
        }

        if (changes.__en) {
            let __en = changes.__en.newValue;
            let __ad = await chrome.storage.local.get("__ad").then(({__ad}) => __ad);
            if (!__en)
                __en = __ad || "";
            else if (__ad && (new Date(__ad) <= new Date(__en)))
                __en = __ad;

            document.getElementById("end").value = __en;
        }
    });

    document.getElementById("activate").addEventListener("change", async function () {
        chrome.storage.local.set({__ap: this.checked});
        let [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        chrome.tabs.sendMessage(tab.id, {action: "activate", status: this.checked});
    });

    document.getElementById("autobook").addEventListener("change", async function () {
        chrome.storage.local.set({__ab: this.checked});
    });

    document.getElementById("frequency").addEventListener("change", function () {
        chrome.storage.local.set({__fq: this.value});
    });

    document.getElementById("start").addEventListener("change", function () {
        chrome.storage.local.set({__st: this.value || new Date().toISOString().split('T')[0]});
    });

    document.getElementById("end").addEventListener("change", async function () {
        let __ad = await chrome.storage.local.get("__ad").then(({__ad}) => __ad);
        if (!this.value)
            this.value = __ad || "";
        else if (__ad && (new Date(__ad) <= new Date(this.value)))
            this.value = __ad;

        chrome.storage.local.set({__en: this.value || ""});
    });

    document.getElementById("ais_visa_info").addEventListener("submit", async function (e) {
        e.preventDefault();
        let button = document.getElementById("reset_info");
        button.setAttribute("disabled", "disabled");

        await new Promise(r => setTimeout(r, 500));

        await chrome.storage.local.clear();
        await chrome.storage.local.set({__ab: false, __ap: true, __fq: 60});

        let [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        await chrome.tabs.sendMessage(tab.id, {action: "logout"});

        button.classList.toggle("btn-success");
        button.innerText = "Success";
        await new Promise(r => setTimeout(r, 1000));
        button.classList.toggle("btn-success");
        button.removeAttribute("disabled");
        button.innerText = "Reset All Data";
    });
})();