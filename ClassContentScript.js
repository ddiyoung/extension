{
    class DataFromCourse {
        constructor(id, week, contentname, pass){
            this.id = id;
            this.week = week;
            this.contentname = contentname;
            this.pass = pass;
        }

        divideContentName(){
            const idxSlash = this.contentname.lastIndexOf('/');
            const lecturename = this.contentname.slice(0, idxSlash);
            const duedate = this.contentname.slice(idxSlash+1, this.contentname.length).split('~');
            const attendance = duedate[0].trim();
            const deadline = duedate[1].trim();
            const result = {lecturename, attendance, deadline}
            return result;
        }
    }

    class SeparateContentName extends DataFromCourse{
        constructor(lecturename, attendance, deadline){
            this.lecturename = lecturename;
            this.attendance = attendance;
            this.deadline = deadline;
        }
    }


}