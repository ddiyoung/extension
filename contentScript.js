function getCourseIdList(){
    const nodes = document.querySelectorAll('.course-id span');
    const list = [].slice.call(nodes);
    return list.map(elem => elem.innerText);
}
var divA = document.createElement('div');
var myList = getCourseIdList().join();
divA.innerHTML = myList;

chrome.storage.local.set({ myList });