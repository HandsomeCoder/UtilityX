(function () {

    let abbreviations = {}
    let services = {}
    
    function initialize() {

        loadServices()

        loadAbbreviations();

        loadListners()

        scanForEditableFields()
    }

    function scanForEditableFields(){

        let documents = [document];
        let editableElements = []
    
        let iframes = document.querySelectorAll('iframe');
    
        for (let iframe of iframes) {
            if (iframe.contentDocument) {
                documents.push(iframe.contentDocument)
            }
        }
    
        for (let doc of documents) {
    
            editableElements.push(...doc.querySelectorAll("textarea"))
            editableElements.push(...doc.querySelectorAll("[contenteditable=true]"))
            editableElements.push(...doc.querySelectorAll("[type=text]"))
    
        }
    
        for (let editableElement of editableElements) {
            editableElement.addEventListener("keyup", function (e) {
                if(!services.abbreviator){
                    return
                }

                if(!e.target.value){
                    return;
                }

                let pharses = e.target.value.match(/=[a-zA-Z]+/ig)
                if (pharses) {
                    pharses = pharses.map(pharse => pharse.substr(1))
    
                    checkForAbbreviations(pharses, e.target)
                }
            })
        }
    }

    function loadListners(){
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
            if (request.todo == "CHANGE_IN_ABBREVIATIONS"){
                loadAbbreviations();
            } else if(request.todo == "SERVICE_STATUS_UPDATE"){
                loadServices();
            }
        });
    }

    function loadAbbreviations(){
        chrome.storage.sync.get("abbreviations", function (response) {
            abbreviations = response.abbreviations;
        })
    }

    function loadServices(){
        chrome.storage.sync.get("services", function (response) {
            services = response.services ? response.services : {};
        })
    }

    function checkForAbbreviations(pharses, target) {
        for (let pharse of pharses) {
            if (abbreviations[pharse]) {
                let value = target.value.replaceAll("=" + pharse, abbreviations[pharse]);
                target.value = value;
            }
        }
    }

    initialize();

})();