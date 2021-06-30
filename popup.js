{
    const check = () =>{
        $("input[type='checkbox']").on('click', '#control-lock', () => {
            chrome.tabs.executeScript({
                file: 'contentScript.js'
            });
        })
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
            }
        });
    }

    const goBlackCourse = () => {
        $("#Black-Course").on('click', () =>{
            chrome.tabs.create({
                url: "https://blackboard.sejong.ac.kr/ultra/course"
            });
        });
    }
    
    const main = () => {
        IsUrlRight();
        check();
        goBlackCourse();
    }

    main();
}