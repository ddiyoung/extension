{
    const getUserId = () => {
        const sidebar_user_name = document.getElementById('sidebar-user-name');
        if(sidebar_user_name){
            const classes = sidebar_user_name.className;
            return classes.split(' ')[2].split('course_user')[1];
        }
    }

    const NowDate = () => {
        const offset = new Date();
        
        return (new Date(offset.getTime() - (offset.getTimezoneOffset() * 60000))).toISOString();
    }

    const getCourseIdList = () => {
        const url = `https://blackboard.sejong.ac.kr/learn/api/v1/users/${getUserId()}/memberships?expand=course.effectiveAvailability,course.permissions,courseRole&includeCount=true&limit=10000`;
        return new Promise((resolve, reject) => {
            $.get(url, ({ results }) => {
                const Now = NowDate();
                const refined = results.filter(elem => elem.course.description).filter(elem => elem.course.startDate < Now).filter(elem => elem.course.endDate > Now);
                resolve(refined.map(elem => ({
                    courseId: elem.course.courseId,
                    name: elem.course.name,
                    course_Number: elem.courseId
                })));
            });
        });
    }

    const getContentId = async (courseId, week) => {
        const url = `https://blackboard.sejong.ac.kr/webapps/blackboard/execute/course/menuFolderViewGenerator`;
        const parm = {
            initTree : 'true',
            storeScope : 'Session',
            course_id : courseId,
            displayMode : 'courseLinkPicker',
            content_id : ''
        };
        
        const Course_Id = courseId;
        return new Promise((resolve, reject) =>{
            $.post(url, parm, ({children}) =>{
                for(let i = 0 ; i < children[0].children.length; i++){
                    if(children[0].children[i].children.length !== 0){
                        if(children[0].children[i].children[0].contents.indexOf('title=\"공지\"') !== -1){
                            const idStr = children[0].children[i].children[week].id;
                            const Content_Id = idStr.slice(idStr.lastIndexOf(':')+1, idStr.length);
                            const refined = {Content_Id, Course_Id};
                            resolve(refined);
                        }
                    }
                }
            })
        })
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

    const getContentData = async (courseIdList) => {
        const Course_Id = courseIdList[0];
        const refined = [];

        await new Promise((resolve, reject) =>{
            for(let i = 0; i < Course_Id.length; i++){
                setTimeout(async () =>{
                    refined.push(await getContentId(Course_Id[i], 0));
                }, i * 100);
            }

            setTimeout(() =>{
                resolve();
            }, 1000);
        })

        return refined;
    };
    
    const getCourseData = async (courseIdList) =>{
        const CourseList = courseIdList;
        const refined = [];
    
        await new Promise((resolve, reject) =>{
            for (let i = 0 ; i < CourseList.length; i++){
                setTimeout(async () => {
                    refined.push(await getDataFromCourse(CourseList[i]));
                }, i * 150);
            }
            
            setTimeout(()=>{
                resolve();
            }, 2000);
        })
        
        return refined;
    };
    
    const ManufactureData = async (courseIdList) =>{
        const totalCourseData = (await getCourseData(courseIdList)); 
        const Nowsecond = NowDate().replace(/T/, ' ').replace(/\..+/, '');
        const Now = Nowsecond.slice(0, Nowsecond.length -3);
        const refined = [];
    
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

    const AddContentId = async () => {
        const merged = await MergeIdName();
        const data = window.P? await CompleteData(merged.map(elem => elem.id)) : await NpData(merged.map(elem => elem.id));

        const Course_Id_List = [];
        Course_Id_List.push(merged.map(elem => elem.Course_Id));
        const Content_data = await getContentData(Course_Id_List);
        let week;
        data.map(elem =>{
            Content_data.map(e =>{
                if(elem.Course_Id === e.Course_Id){
                    week = elem.week[0];
                    const Split = e.Content_Id.split('_');
                    const Content = parseInt(Split[1]) + parseInt(week);
                    const id = {
                        Content_Id : '_'+Content +'_1'
                    }
                    Object.assign(elem, id);
                }
            })
        })

        return data;
    }

    const AddBaseDom = async () =>{
        const data = await AddContentId();

        const NameList = [...new Set(data.map(elem => elem.Name))];
        const ref = NameList.map(elem => ({
            name: elem,
            arr: [...data.filter(elem2 => elem2.Name === elem)]
        }));
        console.log(ref);
        const siteMenu = document.getElementById('side-menu');
        siteMenu.style.transform = 'translateY(600px)';
        window.addEventListener('scroll', (e) => {
            siteMenu.style.transform = `translateY(${600 - window.pageYOffset}px)`;
        });

        const videoUrl = `https://blackboard.sejong.ac.kr/webapps/blackboard/content/listContent.jsp?`;


        const classBody = document.createElement('div');
        classBody.style.height = '600px';
        classBody.style.padding = '30px';
        classBody.style.boxSizing = 'border-box';
        classBody.style.backgroundColor = '#cecece';
        classBody.style.overflowY = 'auto';
        classBody.style.display = 'flex';
        classBody.style.flexWrap = 'nowrap';




        const items = ref.map(lecture => {
            const itemWrapper = document.createElement('div');
            itemWrapper.style.backgroundColor = '#ededed';
            itemWrapper.style.padding = '10px';
            itemWrapper.style.flexDirection = 'column';
            itemWrapper.style.marginRight = '10px';
            itemWrapper.style.display = 'inline-block';
            itemWrapper.style.width = '220px';
            itemWrapper.style.height = `${32 + 160 * lecture.arr.length + 80}px`;
            itemWrapper.style.borderRadius = '4px';
            itemWrapper.style.boxShadow = '0 2px 6px rgba(255, 255, 255, 0.2), 0 2px 6px rgba(255, 255, 255, 0.2)';


            const courseName = document.createElement('div');
            courseName.style.fontSize = '16px';
            courseName.style.fontWeight = 'bold';
            courseName.style.overflow = 'hidden';
            courseName.style.height = '22px';
            courseName.style.marginBottom = '10px';
            courseName.style.textOverflow = 'ellipsis';
            courseName.style.color = `#${Math.floor(Math.random() * 1000)}`;
            courseName.innerText = lecture.name;
            
            itemWrapper.append(courseName);


            const passed = {
                ...lecture,
                arr: lecture.arr.filter(course => course.pass === 'P')
            };
            const notPassed = {
                ...lecture,
                arr: lecture.arr.filter(course => course.pass === 'F')
            };

            const mappedItemsPassed = passed.arr.map(course => {
                const link = document.createElement('a');
                link.href = `${videoUrl}course_id=${course.Course_Id}&content_id=${course.Content_Id}`;
                link.display = 'block';
                link.target = '_blank';
                link.style.textDecoration = 'none';

                const item = document.createElement('div');
                item.style.height = '150px';
                item.style.width = '200px';
                item.style.backgroundColor = 'white';
                item.style.boxShadow = '0 2px 3px rgba(0, 0, 0, 0.1), 0 2px 3px rgba(0, 0, 0, 0.1)';
                item.style.marginBottom = '10px';
                item.style.padding = '10px';
                item.style.borderRadius = '4px';
                item.style.transitionDuration = '300ms';
                item.style.transitionProperty = 'box-shadow';
                item.style.color = 'black';

                item.addEventListener('mouseover', (e) => {
                    item.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)';
                });

                item.addEventListener('mouseleave', (e) => {
                    item.style.boxShadow = '0 2px 3px rgba(0, 0, 0, 0.1), 0 2px 3px rgba(0, 0, 0, 0.1)';
                });

                const attendance = document.createElement('div');
                attendance.style.fontSIze = '12px';
                attendance.innerHTML = `${course.Attendance} ~`;
                
                const deadLine = document.createElement('div');
                deadLine.style.fontSIze = '12px';
                deadLine.style.color = '#ba3838';
                deadLine.style.fontWeight = 'bold';
                deadLine.style.marginBottom = '20px';
                deadLine.innerHTML = `${course.DeadLine} 까지`;
                
                const lectureName = document.createElement('div');
                lectureName.style.fontSIze = '12px';
                lectureName.innerHTML = course.LectureName;
                
                item.append(attendance);
                item.append(deadLine);
                item.append(lectureName);
                link.append(item);

                return link;
            });


            const mappedItemsNotPassed = notPassed.arr.map(course => {
                const link = document.createElement('a');
                link.href = `${videoUrl}course_id=${course.Course_Id}&content_id=${course.Content_Id}`;
                link.display = 'block';
                link.target = '_blank';
                link.style.textDecoration = 'none';

                const item = document.createElement('div');
                item.style.height = '150px';
                item.style.width = '200px';
                item.style.backgroundColor = 'white';
                item.style.boxShadow = '0 2px 3px rgba(0, 0, 0, 0.1), 0 2px 3px rgba(0, 0, 0, 0.1)';
                item.style.marginBottom = '10px';
                item.style.padding = '10px';
                item.style.borderRadius = '4px';
                item.style.transitionDuration = '300ms';
                item.style.transitionProperty = 'box-shadow';
                item.style.color = 'black';

                item.addEventListener('mouseover', (e) => {
                    item.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)';
                });

                item.addEventListener('mouseleave', (e) => {
                    item.style.boxShadow = '0 2px 3px rgba(0, 0, 0, 0.1), 0 2px 3px rgba(0, 0, 0, 0.1)';
                });

                
                const attendance = document.createElement('div');
                attendance.style.fontSIze = '12px';
                attendance.innerHTML = `${course.Attendance} ~`;
                
                const deadLine = document.createElement('div');
                deadLine.style.fontSIze = '12px';
                deadLine.style.color = '#ba3838';
                deadLine.style.fontWeight = 'bold';
                deadLine.style.marginBottom = '20px';
                deadLine.innerHTML = `${course.DeadLine} 까지`;
                
                const lectureName = document.createElement('div');
                lectureName.style.fontSIze = '12px';
                lectureName.innerHTML = course.LectureName;
                
                item.append(attendance);
                item.append(deadLine);
                item.append(lectureName);
                link.append(item);

                return link;
            });
            
            const passHeader = (pass) => {
                const el = document.createElement('div')
                el.style.fontSize = '15px';
                el.style.fontWeight = 'bold';
                el.style.color = pass === 'P' ? 'green' : 'red';
                el.innerHTML = pass === 'P' ? '이미 본' : '봐야 할';
                return el;
            };
            
            if (notPassed.arr.length) {
                itemWrapper.append(passHeader('F'));
                itemWrapper.append(...mappedItemsNotPassed);
            }

            if (passed.arr.length) {
                itemWrapper.append(passHeader('P'))
                itemWrapper.append(...mappedItemsPassed);
            }

            return itemWrapper;
        });

        classBody.append(...items);

        const firstChild = document.getElementById('site-wrap');
        document.body.insertBefore(classBody, firstChild);
        
        return 
    }

    const sendMessageToBack = () =>{
        chrome.runtime.sendMessage({action: "ON"}, (response) =>{
            console.log('Response: ', response);
        });
    }


    const main = async () => {
        await AddBaseDom();
        sendMessageToBack();
    }

    main();
    
}