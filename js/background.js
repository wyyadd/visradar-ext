chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async function (def) {
        let response = {};
        response.action = def.action;
        if (def.action === "fetch_info") {
            let {__un} = await chrome.storage.local.get("__un");
            let {__pw} = await chrome.storage.local.get("__pw");
            let {__id} = await chrome.storage.local.get("__id");
            let {__ap} = await chrome.storage.local.get("__ap");
            let {__il} = await chrome.storage.local.get("__il");
            let {__ad} = await chrome.storage.local.get("__ad");
            let {__al} = await chrome.storage.local.get("__al");
            let {__ar} = await chrome.storage.local.get("__ar");
            let {__st} = await chrome.storage.local.get("__st");
            let {__en} = await chrome.storage.local.get("__en");
            response.data = {
                $username: __un,
                $password: __pw,
                $appid: __id,
                $active: __ap,
                $apptCenter: __il,
                $apptDate: __ad,
                $ascCenter: __al,
                $ascReverse: __ar,
                $start: __st,
                $end: __en,
            }
        }
        port.postMessage(response);
    });
});

chrome.runtime.onInstalled.addListener(async ({reason}) => {
    chrome.action.disable();
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        let exampleRule = {
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'ais.usvisa-info.com'},
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()],
        };

        let rules = [exampleRule];
        chrome.declarativeContent.onPageChanged.addRules(rules);
    });
    if (reason === 'install') {
        await chrome.storage.local.set({__ab: false, __ap: true, __fq: 60});
        chrome.tabs.create({
            url: "https://ais.usvisa-info.com/en-us/countries_list/niv"
        });
    }
});

var myNotificationID = null,
    senderId = null,
    ensureSendMessage = (tabId, message, callback) => {
        chrome.tabs.sendMessage(tabId, {ping: true}, function (response) {
            if (response && response.pong) {
                chrome.tabs.sendMessage(tabId, message, callback);
            }
        });
    };

chrome.notifications.onButtonClicked.addListener(function (notifId, btnId) {
    if (notifId === myNotificationID) {
        chrome.tabs.get(senderId, function (tab) {
            chrome.tabs.highlight({'tabs': tab.index}, function () {
            });
        });
        ensureSendMessage(senderId, {bookNow: btnId === 0});
    }
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    chrome.notifications.create(req.options, function (id) {
        myNotificationID = id;
        senderId = sender.tab.id;
    });
    sendResponse(true);
});