(function () {
    function enableContextMenus() {
        let menuItem = {
            id: "utilityX",
            title: "Add Abbreviations",
            contexts: ["selection"],
        };
        chrome.contextMenus.create(menuItem);

        chrome.contextMenus.onClicked.addListener(function (clickData) {
            if (clickData.menuItemId == "utilityX" && clickData.selectionText) {

                // TODO: Take user input here
                let abbreviation = "Sample";
                chrome.storage.sync.get(["abbreviations"], function (response) {
                    let abbreviations = response["abbreviations"];
                    abbreviations = abbreviations ? abbreviations : {};
                    let fullform = clickData.selectionText;

                    if (!abbreviations[abbreviation]) {
                        abbreviations[abbreviation] = fullform;

                        chrome.storage.sync.set(
                            { abbreviations: abbreviations },
                            function () {
                                sendMessageToAllTabs({
                                    todo: "CHANGE_IN_ABBREVIATIONS",
                                });

                                chrome.notifications.create(
                                    "ABBREVIATION_ADDED",
                                    {
                                        type: "basic",
                                        title: "Added!",
                                        iconUrl: "assets/16px.png",
                                        message:
                                            "Added! Abbreviation addded successfully",
                                        priority: 1,
                                    }
                                );
                            }
                        );
                    } else {
                        chrome.notifications.create(
                            "ABBREVIATION_ADDITION_FAILED",
                            {
                                type: "basic",
                                title: "Error",
                                iconUrl: "assets/16px.png",
                                message:
                                    "Uh oh, Already have one abbreviation with this key",
                                priority: 1,
                            }
                        );
                    }
                });
            }
        });
    }

    function sendMessageToAllTabs(message) {
        (async () => {
            const [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });
            const response = await chrome.tabs.sendMessage(tab.id, message);
            console.log(response);
        })();
    }

    enableContextMenus();
})();
