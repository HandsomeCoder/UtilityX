(function(){

    const abbreviator = document.getElementById("abbreviator");

    function initialize(){
        
        abbreviator.onchange = function(){
            chrome.storage.sync.get("services", function (response) {
                let services = response.services ? response.services : {}
                services["abbreviator"] = abbreviator.checked;
        
                chrome.storage.sync.set({services: services}, function(){
                    sendMessageToAllTabs({todo: "SERVICE_STATUS_UPDATE"})
                })
        
            })
        }

        chrome.storage.sync.get("services", function (response) {
            let services = response.services ? response.services : {}
            abbreviator.checked = services.abbreviator
        })




    }
    
    function sendMessageToAllTabs(message){
        chrome.tabs.query({}, function(tabs){
            for(let tab of tabs){
                chrome.tabs.sendMessage(tab.id, message);
            }
        })
    }

    initialize();

})();

