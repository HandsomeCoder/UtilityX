(function () {

    function initialize() {

        let addAbbreviationForm = document.getElementById("addAbbreviationForm");
        addAbbreviationForm.onsubmit = addAbbreviation;

        loadAbbreviationsTable()

        loadListners()

    }

    function loadListners(){
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
            if (request.todo == "CHANGE_IN_ABBREVIATIONS"){
                loadAbbreviationsTable();
            }
        });
    }

    function loadAbbreviationsTable(){

        chrome.storage.sync.get("abbreviations", function (response) {

            if (response.abbreviations) {
                let abbreviationTable = document.getElementById("abbreviation-table");

                let matrix = Object.entries(response.abbreviations)

                for(let row in matrix){ matrix[row].unshift(parseInt(row)+1); }

                abbreviationTable.removeChild(abbreviationTable.firstChild)

                abbreviationTable.appendChild(tableAbbreviationCreate(
                    matrix.length,
                    3,
                    ["#","Abbreviations", "Full Form", "Action"],
                    matrix,
                    { width: "100%" }))



            }
        })
    }

    function addAbbreviation(){
        let abbreviation = document.forms.addAbbreviationForm["abbreviation"].value;
        let fullform = document.forms.addAbbreviationForm["fullform"].value;

        chrome.storage.sync.get("abbreviations", function (response) {
            let abbreviations = response["abbreviations"]
            abbreviations = abbreviations ? abbreviations : {};

            if(!abbreviations[abbreviation]){
                abbreviations[abbreviation] = fullform;

                chrome.storage.sync.set({"abbreviations" : abbreviations}, function(){
                    
                    document.forms.addAbbreviationForm["abbreviation"].value = "";
                    document.forms.addAbbreviationForm["fullform"].value = "";

                    sendMessageToAllTabs({todo: "CHANGE_IN_ABBREVIATIONS"})

                    loadAbbreviationsTable();
                })
            }
        })

        return false;
    }

    function removeAbbreviation(key){
        return function(){
            chrome.storage.sync.get("abbreviations", function (response) {
                let abbreviations = response["abbreviations"]
                abbreviations = abbreviations ? abbreviations : {};
    
                if(abbreviations[key]){
                    delete abbreviations[key];
                    chrome.storage.sync.set({"abbreviations" : abbreviations}, function(){   
                        sendMessageToAllTabs({todo: "CHANGE_IN_ABBREVIATIONS"})
    
                        loadAbbreviationsTable();
                    })
                }
            })
        }
    }

    function sendMessageToAllTabs(message){
        chrome.tabs.query({}, function(tabs){
            for(let tab of tabs){
                chrome.tabs.sendMessage(tab.id, message);
            }
        })
    }

    function tableAbbreviationCreate(rows, cols, headers, matrix, options) {

        let tbl = document.createElement('table');
        tbl.style.width = options.width;

        tbl.setAttribute("class", "table table-striped")
        
        let thead = document.createElement('thead');
        let tr = document.createElement('tr');

        for(let i = 0; i < headers.length; i++){
            let th = document.createElement('th');
            th.appendChild(document.createTextNode(headers[i]))
            tr.appendChild(th)
        }

        thead.appendChild(tr);

        tbl.appendChild(thead);

        let tbdy = document.createElement('tbody');
 
   

        for (let i = 0; i < rows; i++) {
            let tr = document.createElement('tr');
            for (let j = 0; j < cols; j++) {
                let td = document.createElement('td');
                td.appendChild(document.createTextNode(matrix[i][j]))
                tr.appendChild(td)
            }

            let td = document.createElement('td');

            inputElement = document.createElement('input');
            inputElement.setAttribute("type", "button")
            inputElement.setAttribute("value", "Remove")
            inputElement.onclick = removeAbbreviation(matrix[i][1])

            td.appendChild(inputElement)
            tr.appendChild(td)

            tbdy.appendChild(tr);
        }
        tbl.appendChild(tbdy);

        return tbl;
    }

    initialize()

})();