{
    const getCourseIdList = () => {
        const nodes = document.querySelectorAll('.course-id span');
        const list = [].slice.call(nodes);
        const CourseList = list.map(elem => elem.innerText).join();
        return CourseList;
    }

    const getSubjectNameList = () =>{
        const nodes = document.querySelectorAll('.js-course-title-element');
        const list = [].slice.call(nodes);
        const SubjectNameList = list.map(elem => elem.innerText).join();
        return SubjectNameList;
    }
    
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
                const subject = [];
                const id = course_id;
                Object.values(tbody.children).map(elem => {
                    const tds = Object.values(elem.children);
                    const week = tds[1].children[1].innerText;
                    const contentname = tds[2].children[1].innerText;
                    const pass = tds[7].children[1].innerText;
                    subject.push({id, week, contentname, pass});
                });
                resolve(subject);
            });
        });
    };
    
    const getDateForm = (contentname) => {
    
        const IdxSlash = contentname.lastIndexOf('/');
        const LectureName = contentname.slice(0, IdxSlash);
        const DueDate = contentname.slice(IdxSlash+1, contentname.length).split('~');
        const Attendance = DueDate[0].trim();
        const DeadLine = DueDate[1].trim();
    
        return ({LectureName, Attendance, DeadLine});
    };
    
    const getCourseData = async () =>{
        const CourseList = getCourseIdList().split(',');
        const refined = [];
    
        await new Promise((resolve, reject) =>{
            for (let i = 0 ; i < CourseList.length; i++){
                setTimeout(async () =>{
                    refined.push(await getDataFromCourse(CourseList[i]));
                }, i * 100);
            }
            
            setTimeout(()=>{
                resolve();
            }, CourseList.length * 100 + 1000);
        })
        
        return refined;
    };
    
    const ManufactureData = async () =>{
        const totalCourseData = (await getCourseData()); 
        const Nowsecond = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const Nowtest = Nowsecond.slice(0, Nowsecond.length -3);
        const refined = [];
    
        const Now = "2021-04-07 12:00";
    
        totalCourseData.map(elem =>{
            elem.map(e =>{
                const Duedate = getDateForm(e.contentname);
                if(Duedate.Attendance <= Now && Now <= Duedate.DeadLine){
                    refined.push({...e, ...Duedate});
                }
            });
        });
    
        return refined;
    }
    
    const MergeIdName = async () =>{
        const CourseList = getCourseIdList().split(',');
        const NameList = getSubjectNameList().split(',');
    
        const MergeList = [];
    
        for(let i = 0 ; i < CourseList.length; i++){
            const obj = {
                'id' : CourseList[i],
                'Name' : NameList[i]
            };
            MergeList.push(obj);
        }
    
        return MergeList;
    }
    
    
    const CompleteData = async () => {
        const Manufactured = await ManufactureData();
        const MergeList = await MergeIdName();
    
        Manufactured.map(elem =>{
            const index = MergeList.findIndex(m => m.id == elem.id);
            elem.Name = MergeList[index].Name;
        })
    
        return Manufactured;
    }
    
    const NpData = async () =>{
        const Data = await CompleteData();
        const NpList = [];
    
        Data.map(elem =>{
            if(elem.pass === 'P') NpList.push(elem);
        })
    
        
        return NpList;
    }
    
    
    const main = async () => {

        const NpList = await NpData();
        
        const Atdiv = document.createElement("div");
        Atdiv.innerHTML = "Hello";
        Atdiv.style.float = "right";

        document.querySelector(".slick-track").appendChild(Atdiv);

        console.log(NpList);
       
    }

    main();
}