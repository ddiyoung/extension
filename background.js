{   
    const ListenMessage = () => {
        chrome.runtime.onMessage.addListener( (request, sender, sendResponse) =>{
            console.log("ON");
            if(request.action === "ON"){
                chrome.storage.local.set({'ON' : 1});
                
            }
            else{
                chrome.storage.local.set({'ON' : 0});
                console.log("OFF");
            }
        } )
    }

    const main = () => {
        ListenMessage();
    }

    main();
}