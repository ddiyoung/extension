{
    const getUserId = () => {
        const classes = document.getElementById('sidebar-user-name').className;
        return classes.split(' ')[2].split('course_user')[1];
    }

    const getCourseIdList = () => {
        const url = `https://blackboard.sejong.ac.kr/learn/api/v1/users/${getUserId()}/memberships?expand=course.effectiveAvailability,course.permissions,courseRole&includeCount=true&limit=10000`;
        return new Promise((resolve, reject) => {
            $.get(url, ({ results }) => {
                const refined = results.filter(elem => elem.course.description).filter(elem => elem.course.term.name === '2021학년도 1학기');
                resolve(refined.map(elem => ({
                    courseId: elem.course.courseId,
                    name: elem.course.name,
                    course_Number: elem.courseId
                })));
            });
        });
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
    
    const getCourseData = async (courseIdList) =>{
        const CourseList = courseIdList;
        const refined = [];
    
        await new Promise((resolve, reject) =>{
            for (let i = 0 ; i < CourseList.length; i++){
                setTimeout(async () => {
                    refined.push(await getDataFromCourse(CourseList[i]));
                }, i * 100);
            }
            
            setTimeout(()=>{
                resolve();
            }, 2000);
        })
        
        return refined;
    };
    
    const ManufactureData = async (courseIdList) =>{
        const totalCourseData = (await getCourseData(courseIdList)); 
        const Nowsecond = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const Nowtest = Nowsecond.slice(0, Nowsecond.length -3);
        const refined = [];
    
        const Now = "2021-03-07 12:00";
    
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
        return (await getCourseIdList()).map(elem => ({
            id: elem.courseId,
            Name: elem.name,
            Course_Id: elem.course_Number
        }));
    };
    
    
    const CompleteData = async (courseIdList) => {
        const Manufactured = await ManufactureData(courseIdList);
        const MergeList = await MergeIdName();

        Manufactured.map(elem =>{
            const index = MergeList.findIndex(m => m.id == elem.id);
            elem.Name = MergeList[index].Name;
            elem.Course_Id = MergeList[index].Course_Id;
        })
    
        return Manufactured;
    }
    
    const NpData = async (courseIdList) =>{
        const Data = await CompleteData(courseIdList);
        return Data.filter(elem => elem.pass !== 'P');
    }

    const getElement = (type) => document.createElement(type);

    const setInnerText = (container, inner) => {
        if (Array.isArray(inner)) {
            container.innerText = inner.join(' ');
            return container;
        }
        container.innerText = inner;
        return container;
    }

    const addStyle = () => {
        const style = document.createElement('style');

        style.innerText = `
            .atd-wrapper{
                float: right;
            }
        `;

        document.head.appendChild(style);
    }

    const drawDom = async (courseIdList, P) => {
        const data = P? await CompleteData(courseIdList) : await NpData(courseIdList);

        console.log(data);

        const header = document.querySelector('#main-content-inner');
        const wrapper = document.createElement('div');
        header.style.display = 'block';
        header.style.height = 'auto';

        data.map(elem => {
            const div = getElement('div');
            
            div.append(setInnerText(getElement('div'), [elem.Name, elem.LectureName]));
            div.append(setInnerText(getElement('div'), [elem.Attendance, elem.DeadLine]));
            div.append(setInnerText(getElement('div'), [elem.week, elem.pass]));
            div.style.display = "flex";
            wrapper.append(div);
        });

        wrapper.className = 'atd-wrapper hide-in-background themed-background-primary-fill-only';

        addStyle();
        header.append(wrapper);
    }

    const sendMessageToBack = () =>{
        chrome.runtime.sendMessage({action: "ON"}, (response) =>{
            console.log(response);
        });
        
    }

    const main = async () => {
        const merged = await MergeIdName();

        var P = window.P;

        await drawDom(merged.map(elem => elem.id), P);
    }

    main();
    sendMessageToBack();
}