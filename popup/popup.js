(function(){

    const abbreviator = document.getElementById("abbreviator");
    const loremipsum = document.getElementById("loremipsum");

    function initialize(){
        
        abbreviator.onchange = function(){
            changeStatusOfService("abbreviator", abbreviator.checked)
        }

        // loremipsum.onchange = function(){
        //     changeStatusOfService("loremipsum", loremipsum.checked);
        // }

        chrome.storage.sync.get("services", function (response) {
            let services = response.services ? response.services : {}
            abbreviator.checked = services.abbreviator
        })




    }

    function changeStatusOfService(key, value){
        chrome.storage.sync.get("services", function (response) {
            let services = response.services ? response.services : {}
            services[key] = value;
    
            chrome.storage.sync.set({services: services}, function(){
                sendMessageToAllTabs({todo: "SERVICE_STATUS_UPDATE"})
            })
    
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

