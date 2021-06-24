chrome.tabs.executeScript({
    file: 'contentScript.js'
});

const getStorageData = (str) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(str, (res) => {
            if (res.myList) {
                resolve(res.myList);
            }
            reject();
        });
    });
};

const getDataFromCourse = (course_id) => {
    return new Promise((resolve, reject) => {
        $.get(`https://blackboard.sejong.ac.kr/webapps/bbgs-OnlineAttendance-BB5cf774ff89eaf/app/atdView?custom_user_id=1234&showAll=true&custom_course_id=${course_id}`, (data) => {
            const regex = /<tbody id="listContainer_databody">/g;
            const regex2 = /<\/tbody>/g;
            const str2 = '</tbody>';
            const idx = data.search(regex);
            const idx2 = data.search(regex2);
    
            const refined = data.slice(idx, idx2 + str2.length);
            const tbody = $(refined)[0];
            Object.values(tbody.children).map(elem => {
                const tds = Object.values(elem.children);
                const val1 = tds[1].children[1].innerText;
                const val2 = tds[2].children[1].innerText;
                const val3 = tds[7].children[1].innerText;
                console.log(val1, val2, val3);
                resolve({ val1, val2, val3 });
            });
        });
    });
}

const main = async () => {
    const arr = (await getStorageData('myList')).split(',');


    arr.map(async elem => {
        await getDataFromCourse(elem);
    });
    
};


main();