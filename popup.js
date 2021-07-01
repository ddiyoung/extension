{
    const check = () =>{
        $("input[type='checkbox']").on('click', () => {
            chrome.tabs.executeScript({
                file: 'contentScript.js'
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
        $('.closeAtd').html(`
            <h2></h2>
            <div class ="popup-controlattend-container">
                <div>
                    <p class = "extension-txt">출석 확인란 새로고침</p>
                    <p class = "extension-txt">Refresh Attendance Check Box</p>
                </div>

            </div>
        `);
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
            if (currentTab === 'blackboard.sejong.ac.kr/ultra/course') {
                $('.no-error').html(`
                <h2>출석 확인하기</h2>
                <div class ="popup-controlattend-container">
                    <div>
                        <p class = "extension-txt">모든 강의 출석 확인하기</p>
                        <p class = "extension-txt">Check Attendance For All Courses</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="control-lock">
                        <span class="slider round"></span>
                    </label>
                </div>
                <p>
                    <button id="CheckAtd" class = "extension-btn" type="button"> 출석 확인 하기 </button>
                </p>
                `);
                goAtd();
            } else {
                $('.wrongSite').html(`
                    <div class = "popup-error-container">
                        <p class = "extension-txt">블랙보드 코스 탭에서 실행해주세요.</p>
                        <br>
                        <p class = "extension-txt">Please run in the blackboard course tab.</p>
                        <p>
                            <button id="Black-Course" class="extension-btn" type="button"> 블랙보드 코스 바로가기 </button>
                        </p>
                    </div>
                `);
                goBlackCourse();
            }
        });
    }

    
    
    const main = () => {
        IsUrlRight();
    }

    main();
}