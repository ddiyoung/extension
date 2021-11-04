{
    class DataFromCourse {
        constructor(id, week, contentname, pass){
            this.id = id;
            this.week = week;
            this.contentname = contentname;
            this.pass = pass;
        }
    }

    class SeparateContentName extends DataFromCourse{
        constructor(){
            const idxSlash = this.contentname.lastIndexOf('/');
            this.lecturename = this.contentname.slice(0, idxSlash);
            const duedate = this.contentname.slice(idxSlash+1, this.contentname.length).split('~');
            this.attendance = duedate[0].trim();
            this.deadline = duedate[1].trim();
        }
    }

    class LectureInfo extends SeparateContentName{
        constructor() {
            this.content_id = "";
        }
    }

    class CourseInfo{
        constructor() {
            this.name = "";
            this.course_id = "";
        }
    }
}