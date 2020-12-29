(function () {

    let abbreviations = {}
    let services = {}

    function initialize() {

        loadServices();

        loadAbbreviations();

        loadListners();

        scanForEditableFields();

        loadObservers();
    }

    function loadObservers() {

        const targetNode = document.body;

        const config = { childList: true, subtree: true };

        const observer = new MutationObserver(function (mutationsList, observer) {
            scanForEditableFields();
        });

        observer.observe(targetNode, config);
    }

    function scanForEditableFields() {

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
            editableElements.push(...doc.querySelectorAll("[type=email]"))
        }

        for (let editableElement of editableElements) {
            if (new Set(["INPUT", "TEXTAREA"]).has(editableElement.nodeName)) {

                editableElement.addEventListener("keyup", listenerForAbbreviations);
                editableElement.addEventListener("keyup", listenerForLoremipsum);

            } else if (new Set(["DIV", "P"]).has(editableElement.nodeName)) {

                observerForAbbreviations(editableElement);

            }
        }
    }

    function listenerForLoremipsum() {
        if (!services.loremipsum) {
            return
        }

        if (!e.target.value) {
            return;
        }

        let pharses = e.target.value.match(/=lorem\([0-9]*\)/ig)
        if (pharses) {
            pharses = pharses.map(pharse => pharse.substr(1))
            checkForLoremipsum(pharses, e.target)
        }
    }

    function listenerForAbbreviations(e) {
        if (!services.abbreviator) {
            return
        }

        if (!e.target.value) {
            return;
        }

        let pharses = e.target.value.match(/=[a-zA-Z]+/ig)
        if (pharses) {
            pharses = pharses.map(pharse => pharse.substr(1))

            let response = checkForAbbreviations(pharses, e.target.value)

            if (response.replacement) {
                e.target.value = response.content;
            }
        }
    }

    function observerForAbbreviations(editableElement) {

        let config = { childList: true, subtree: true, characterData: true };

        let observer = new MutationObserver(function (mutations, observer) {
            if (!services.abbreviator) {
                return
            }

            let content = mutations[0].target.textContent;

            if (!content) {
                return;
            }

            let pharses = content.match(/=[a-zA-Z]+/ig)
            if (pharses) {
                pharses = pharses.map(pharse => pharse.substr(1))

                let response = checkForAbbreviations(pharses, content)

                if (response.replacement) {
                    mutations[0].target.textContent = response.content;
                }
            }
        });

        observer.observe(editableElement, config);
    }

    function loadListners() {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.todo == "CHANGE_IN_ABBREVIATIONS") {
                loadAbbreviations();
            } else if (request.todo == "SERVICE_STATUS_UPDATE") {
                loadServices();
            }
        });
    }

    function loadAbbreviations() {
        chrome.storage.sync.get("abbreviations", function (response) {
            abbreviations = response.abbreviations;
        })
    }

    function loadServices() {
        chrome.storage.sync.get("services", function (response) {
            services = response.services ? response.services : {};
        })
    }

    function checkForAbbreviations(pharses, content) {

        let originalContent = content;
        let replacement = false;

        for (let pharse of pharses) {
            if (abbreviations[pharse]) {
                replacement = true;
                originalContent = originalContent.replaceAll("=" + pharse, abbreviations[pharse]);
            }
        }

        return { "content": originalContent, "replacement": replacement }
    }

    function checkForLoremipsum(pharses, target) {

    }

    initialize();

})();