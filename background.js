{   
    const DeleteDom = () =>{
        console.log("DeleteDom");
        chrome.tabs.executeScript({
            file: 'DeleteDomScript.js'
        });
    }

    const ListenMessage = () => {
        chrome.runtime.onMessage.addListener( (request, sender, sendResponse) =>{
            if(request.action === "ON"){
                window.ON = 1;
                console.log("Connect");
                sendResponse("ContentScript Injected");
            }
            else if (request.action === "OFF"){
                window.ON = 0;
                console.log("Disconnect")
                sendResponse("DOM Delete");
                DeleteDom();
            }
        });
    };

    const initON = () => {
        if(window.ON) return;
        chrome.webNavigation.onCommitted.addListener((details) => {
            if (["reload", "link", "typed", "generated"].includes(details.transitionType) &&
                details.url === "https://blackboard.sejong.ac.kr/ultra/course") {
        
                window.ON = 0;
                console.log("Reload or Enter the Page");
            }
        });
    }

    const sendMessageToPoP = (msg) =>{
        chrome.runtime.sendMessage({action: msg});
    }

    const POPUPON = () =>{
        chrome.runtime.onMessage.addListener( (request, sender, sendResponse) =>{
            if(request.action === "POPUP ON"){
                console.log("ON is "+window.ON);
                sendMessageToPoP("ON is " + window.ON);
            }
        })
    }

    const main = () => {       
        window.ON = 0;
        initON();
        POPUPON();
        ListenMessage();
    }

    main();
}