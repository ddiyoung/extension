function getCourseIdList(){
    const nodes = document.querySelectorAll('.course-id span');
    const list = [].slice.call(nodes);
    return list.map(elem => elem.innerText);
}

var myList = getCourseIdList().join();
chrome.storage.local.set({ myList });