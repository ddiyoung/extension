const check = () =>{
    $("input[type='checkbox']").click(() => {
        chrome.tabs.executeScript({
            file: 'contentScript.js'
        });
    })
}

check();