{
    const ExecuteContent = () =>{
        chrome.tabs.executeScript({
            file: 'contentScript.js'
        });
    }

    const Pcheck = () =>{
        $("input[type='checkbox']").on('click', () => {
            var checkbox = $('input[type="checkbox"]');
            if ($(checkbox).prop('checked')) {
                chrome.tabs.executeScript({
                    code: 'window.P = 1;'
                });
            } else{
                PUnCheck();
            }
        });
    }

    const PUnCheck = () =>{
        chrome.tabs.executeScript({
            code: 'window.P = 0;'
        });
    }

    const startLoading = () => {
        $("#control-lock").prop("disabled", !0), $("#CloseBtn").prop("disabled", !0),
        $('#Refresh-btn').prop("disabled", !0),  $("#control-lock2").prop("disabled", !0),
        $("#CheckAtd").prop("disabled", !0), $("#CheckAtd").html('Loading <span class="ellipsis-anim"><span>.</span><span>.</span><span>.</span></span>');
    }

    const stopLoading = () =>{
        $("#control-lock").prop("disabled", !1), $("#CloseBtn").prop("disabled", !1),
        $('#Refresh-btn').prop("disabled", !1),  $("#control-lock2").prop("disabled", !1),
        $("#CheckAtd").prop("disabled", !1), $("#CheckAtd").text("출석 확인 하기");
    }

    const InitView = () =>{
        $('.title-container').removeClass('hidden'), $('.check-container').removeClass('hidden'),
        $('.check-btn-container').removeClass('hidden');
    }

    const CloseAtd = () =>{
        $('.refresh-div').removeClass('hidden'), $('.closeAtd-btn').removeClass('hidden'),
        $('.title-container').addClass('hidden'), $('.check-btn-container').addClass('hidden');;
    }

    const sendMessageToBack = () =>{
        chrome.runtime.sendMessage({action: "OFF"});
    }

    const CloseAtdWindow = () =>{
        PUnCheck();
        sendMessageToBack();
        window.close();
    }

    const ClickCloseBtn = () =>{
        $('#CloseBtn').on('click', () =>{
            CloseAtdWindow();
        })
    }

    const goAtd = () =>{
        $("#CheckAtd").on('click', () =>{
            ExecuteContent();
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
                //$('.no-error').removeClass('hidden');
                InitView();          
            } else {
                $('.wrongSite').removeClass('hidden');
            }
        });
    }

    const ClickRefresh_btn = () => {
        $('#Refresh-btn').click( () =>{
            ExecuteContent();
            $('.Refresh-btn-logo').addClass('logo-rotate');
            setTimeout( ()=>{
                $('.Refresh-btn-logo').removeClass('logo-rotate');
            }, 2000);
        })
    }

    const BtnFunction = () =>{
        Pcheck();
        goAtd();
        goBlackCourse();
        ClickCloseBtn();
        ClickRefresh_btn();
    }
    
    const main = () => {
        IsUrlRight();
        BtnFunction();

        console.log(chrome.storage.local.get(['ON']));
    }

    main();
}