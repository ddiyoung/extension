{
    const Pcheck = () =>{
        $("input[type='checkbox']").on('click', () => {
            chrome.tabs.executeScript({
                code: 'window.P = 1;'
            });
        })
    }

    async function leaveSessionAsync() {
        const disconnectMessage = new PopupDisconnectMessage("Popup", "Content_Script");
        await Messaging_MessagePasser.sendMessageToTabAsync(disconnectMessage, extensionTab.id), 
        window.close();
    }

    const startLoading = () => {
        $("#control-lock").prop("disabled", !0),
        $("#CheckAtd").prop("disabled", !0), $("#CheckAtd").html('Loading <span class="ellipsis-anim"><span>.</span><span>.</span><span>.</span></span>');
    }

    const stopLoading = () =>{
        $("#control-lock").prop("disabled", !1),
        $("#CheckAtd").prop("disabled", !1), $("#CheckAtd").text("출석 확인 하기");
    }

    const CloseAtd = () =>{
        $('.closeAtd').removeClass('hidden'), $('.no-error').addClass('hidden');
    }

    const goAtd = () =>{
        $("#CheckAtd").on('click', () =>{
            chrome.tabs.executeScript({
                file: 'contentScript.js'
            });
            startLoading();
            setTimeout( () =>{
                stopLoading();
                CloseAtd();
            }, 2000);
        });
    }

    const goBlackCourse = () => {
        $("#Black-Course").on('click', () =>{
            chrome.tabs.create({
                url: "https://blackboard.sejong.ac.kr/ultra/course"
            });
        });
    }

    const IsUrlRight = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            currentTab = tabs[0].url.replace(/(^\w+:|^)\/\//, '');
            if (currentTab === 'blackboard.sejong.ac.kr/ultra/course'){
                $('.no-error').removeClass('hidden');            
            } else {
                $('.wrongSite').removeClass('hidden');
            }
        });
    }

    
    
    const main = () => {
        IsUrlRight();
        Pcheck();
        goAtd();
        goBlackCourse();
    }

    main();
}