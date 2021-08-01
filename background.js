{   
    const ListenMessage = () => {
        chrome.runtime.onMessage.addListener( (request, sender, sendResponse) =>{
            if(request.action === "ON"){
                chrome.storage.local.set({
                    Connect: 1
                }, (function() {
                    console.log("Connect.....");
                }));
            }
            else if (request.action === "OFF"){
                chrome.storage.local.set({
                    Connect: 0
                }, (function() {
                    console.log("Disconnect.....");
                }));
            }
        } )
    }

    const main = () => {
        ListenMessage();
    }

    main();
}