chrome.tabs.executeScript({
    code: "$('#main-content').contents().scrollTop($(document).height());"
})


const check = () =>{
    $("input[type='checkbox']").click(() => {
        chrome.tabs.executeScript({
            file: 'contentScript.js'
        });
    })
}

check();