function getCourseIdList(){
    const nodes = document.querySelectorAll('.course-id span');
    const list = [].slice.call(nodes);
    const CourseList = list.map(elem => elem.innerText).join();
    chrome.storage.local.set({CourseList});
}

function getSubjectNameList(){
    const nodes = document.querySelectorAll('.js-course-title-element');
    const list = [].slice.call(nodes);
    const SubjectNameList = list.map(elem => elem.innerText).join();
    chrome.storage.local.set({SubjectNameList});
}

function main(){
    getCourseIdList();
    getSubjectNameList();
}

main();