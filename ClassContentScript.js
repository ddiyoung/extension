{

    class SeparateContentName{
        constructor(contentname){
            this.lecturename = "";
            this.attendance = "";
            this.deadline = "";
            this.contentname = contentname;
        }

        Separate(){
            const idxSlash = this.contentname.lastIndexOf('/');
            this.lecturename = this.contentname.slice(0, idxSlash);
            const duedate = this.contentname(idxSlash+1, this.contentname.length).split('~');
            this.attendance = duedate[0].trim();
            this.deadline = duedate[1].trim();
        }
    }

    class LectureInfo{
        constructor() {
            this.id = "";
            this.week = "";
            this.lecturename = "";
            this.attendance = "";
            this.deadline = "";
            this.pass = "";
            this.content_id = "";
        }
    }

    class Course {
        constructor() {
            this.name = "";
            this.course_id = "";
        }
    }
}