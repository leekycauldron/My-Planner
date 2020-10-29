document.addEventListener('DOMContentLoaded', () => {
    reloadPage("#testView");

    document.querySelector("#testCreateForm").addEventListener('submit', event => {
        let testCreateName = document.querySelector("#testCreateName").value;
        let testCreateSchool = document.querySelector("#testCreateSchool").value;
        let testCreateTime = document.querySelector("#testCreateTime").value;
        let testCreateSubject = document.querySelector("#testCreateSubject").value;
        //Sends a request to the createTest route with the form data given.
        fetch("/createTest", {
            method: "POST",
            body: JSON.stringify({
                testCreateName: testCreateName,
                testCreateSchool: testCreateSchool,
                testCreateTime: testCreateTime,
                testCreateSubject: testCreateSubject
            })
        })
        .then(response => response.json())
        .then(message => {
            const alert = document.createElement("div");
            callBackAlert(message.error,"Date Error.","warning","Please enter in a date that is NOT before today!",alert);
            callBackAlert(message.message,"Test created.","success","Test Created!",alert);
            reloadPage("#testView");
        })

        event.preventDefault();
    })

    document.querySelector("#testEditForm").addEventListener('submit', event => {
        let testEditName = document.querySelector("#testEditName").value;
        let testEditSchool = document.querySelector("#testEditSchool").value;
        let testEditTime = document.querySelector("#testEditTime").value;
        let testEditSubject = document.querySelector("#testEditSubject").value;
        let testEditTest = document.querySelector("#testEditTest").value;
        //Sends a request to the editTest route with the form data given.
        fetch(`/editTest/${testEditTest}`, {
            method: "POST",
            body: JSON.stringify({
                testEditName: testEditName,
                testEditSchool: testEditSchool,
                testEditTime: testEditTime,
                testEditSubject: testEditSubject
            })
        })
        .then(response => response.json())
        .then(message => {
            const alert = document.createElement("div");
            callBackAlert(message.error,"Date Error.","warning","Please enter in a date that is NOT before today!",alert);
            callBackAlert(message.message,"Test edited.", "success","Test edited successfully!",alert);
            reloadPage("#testView");
        })
        event.preventDefault();
    })
})

//SHOW, HIDE: Takes an array[htmlElement] as an argument and shows/hides them.
function show(...args){
    args[0].forEach(arg => {
        document.querySelector(arg).style.visibility = "visible";
        document.querySelector(arg).style.height = "100%";
    })
}

function hide(...args){
    args[0].forEach(arg => {
        document.querySelector(arg).style.visibility = "hidden";
        document.querySelector(arg).style.height = 0;
    })
}

//Creates and HTML Element and adds attributes to them.
function createHTMLElement(element=null,className=null,html=null) {
    let htmlElement = document.createElement(element);
    htmlElement.className = className;
    htmlElement.innerHTML = html;
    return htmlElement;
}

//Creates an alert div(bootstrap) and customizes it based on the arguments given.
function callBackAlert(callBack,hotSentence,color,html,div) {
    if(callBack === hotSentence) {
        div.className = `alert alert-${color}`;
        div.innerHTML = html;
        document.querySelector("#testCreate").insertBefore(div, document.querySelector("#testCreate").firstChild);
    }
}

function reloadPage(page, test=null) {
    if(page === "#testView") {
        document.querySelector("#testCreateName").value = '';
        document.querySelector("#testCreateSchool").value = '';
        document.querySelector("#testCreateTime").value = '';
        document.querySelector("#testCreateSubject").value = '';
        document.querySelector("#subjectsList").innerHTML = '';
        document.querySelector("#schoolsList").innerHTML = '';
        show(["#testCreate","#testView"]);
        hide(["#testEdit"]);
        document.querySelector("#testView").innerHTML = `<h1>Tests (earliest to latest):</h1>`;    
        fetch(`/getTests`)
        .then(response => response.json())
        .then(message => {
            //Gets the schools and subjects from the JSON data and appends it to the test creation form.
            message.subjects.forEach(subject => {
                let option = document.createElement('option');
                option.value = subject.subject
                option.innerHTML = subject.subject
                document.querySelector("#subjectsList").append(option)
            });

            message.schools.forEach(school => {
                let option = document.createElement('option');
                option.value = school.name
                option.innerHTML = school.name
                document.querySelector("#schoolsList").append(option)
            })

            message.tests.forEach(test => {
                //Creates a card view for each school that has been returned.
                let card = document.createElement("div");
                let br = document.createElement('br');
                card.className = "card";
                let name = createHTMLElement(element='h2',className=null,html=test.name);
                let date = createHTMLElement(element='p',className='text-secondary', html=test.date);
                let subject = createHTMLElement(element='p',className=null,html=`Subject: ${test.subject}`);
                let school = createHTMLElement(element='p', className=null,html=`School: ${test.school}`);
                let editIcon = document.createElement('i')
                editIcon.className = 'fas fa-edit'
                let editBtn = createHTMLElement(element='button', className='btn btn-outline-secondary',html='Edit This Test ');
                editBtn.append(editIcon)
                editBtn.addEventListener('click', () => {
                    reloadPage("#testEdit", test=test.id);
                })
                let cardBody = createHTMLElement(element='div',className="card-body text-center",html=null);
                cardBody.append(name,date,subject,school,editBtn);
                card.append(cardBody);

                document.querySelector("#testView").append(card,br)
            })
        })
       
    } if(page === "#testEdit") {
        document.querySelector("#testEditName").value = '';
        document.querySelector("#testEditSchool").value = '';
        document.querySelector("#testEditTime").value = '';
        document.querySelector("#testEditSubject").value = '';
        document.querySelector("#subjectsList").innerHTML = '';
        document.querySelector("#schoolsList").innerHTML = '';
        document.querySelector("#rowDisplay").innerHTML = '';
        show(["#testEdit"]);
        hide(["#testCreate","#testView"]);
        let row = document.createElement('div')
        row.className = 'row'
        row.id = "displayRow"
        let firstCol = document.createElement('div')
        firstCol.className = 'col-sm'
        let secCol = document.createElement('div')
        secCol.className = 'col-sm'
        let saveIcon  = document.createElement("i")
        saveIcon.className = 'fas fa-save'
        let saveBtn = document.createElement('button');
        saveBtn.id = "testEditBackBtn"
        saveBtn.className = "btn btn-warning form-control"
        saveBtn.innerHTML = "Save. "
        saveBtn.addEventListener('click', () => {
            document.querySelector("#testEditForm").dispatchEvent(new Event('submit'));
        })

        let backIcon  = document.createElement("i")
        backIcon.className = 'fas fa-arrow-alt-circle-left'
        let backBtn = document.createElement('button');
        backBtn.id = "testEditBackBtn"
        backBtn.className = "btn btn-outline-success form-control"
        backBtn.innerHTML = "Go Back. "
        backBtn.append(backIcon)
        saveBtn.append(saveIcon)
        firstCol.append(backBtn)
        secCol.append(saveBtn)
        row.append(firstCol,secCol)
        document.querySelector("#rowDisplay").append(row)
        backBtn.addEventListener('click', () => {
            reloadPage("#testView");
        })
   
        fetch(`/editTest/${test}`)
        .then(response => response.json())
        .then(message => {
            //Adds the existing values for the test.
            document.querySelector("#testEditName").value = message.message.name;
            document.querySelector("#testEditSchool").value = message.message.school;
            document.querySelector("#testEditTime").value = message.message.date;
            document.querySelector("#testEditSubject").value = message.message.subject;
            document.querySelector("#testEditTest").value = test;
            //Gets the schools and subjects from the JSON data and appends it to the test edit form.
            message.subjects.forEach(subject => {
                let option = document.createElement('option');
                option.value = subject.subject
                option.innerHTML = subject.subject
                document.querySelector("#subjectsList").append(option)
            });

            message.schools.forEach(school => {
                let option = document.createElement('option');
                option.value = school.name
                option.innerHTML = school.name
                document.querySelector("#schoolsList").append(option)
            })
        })
    }   
}