(function(){

    function enableContextMenus(){
        let menuItem = {
            "id": "utilityX",
            "title": "Add Abbreviations",
            "contexts": ["selection"]
        };
        chrome.contextMenus.create(menuItem);
    
        chrome.contextMenus.onClicked.addListener(function(clickData){   
            if (clickData.menuItemId == "utilityX" && clickData.selectionText){  
                    let abbreviation = prompt("Abbreviation: ");         
                    chrome.storage.sync.get(['abbreviations'], function(response){

                        let abbreviations = response["abbreviations"]
                        abbreviations = abbreviations ? abbreviations : {};
                        let fullform = clickData.selectionText
                        
                        if(!abbreviations[abbreviation]){
                            abbreviations[abbreviation] = fullform
            
                            chrome.storage.sync.set({"abbreviations" : abbreviations}, function(){
            
                                sendMessageToAllTabs({todo: "CHANGE_IN_ABBREVIATIONS"})

                                var notifOptions = {
                                    type: "basic",
                                    title: "Added!",
                                    iconUrl: "assets/16px.png",
                                    message: "Added! Abbreviation addded successfully"
                                };
                                chrome.notifications.create('limitNotif', notifOptions);
                            })
                        } else {

                            var notifOptions = {
                                type: "basic",
                                title: "Error",
                                iconUrl: "assets/16px.png",
                                message: "Uh oh, Already have one abbreviation with this key"
                            };
                            chrome.notifications.create('limitNotif', notifOptions);
                        }
                    });
            }
        });
    }

    function sendMessageToAllTabs(message){
        chrome.tabs.query({}, function(tabs){
            for(let tab of tabs){
                chrome.tabs.sendMessage(tab.id, message);
            }
        })
    }

    enableContextMenus();

})();