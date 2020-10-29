const converter = new showdown.Converter();
document.addEventListener('DOMContentLoaded', () => {
    loadPage("#notesView");
    document.querySelector('#noteCreateForm').addEventListener('submit', event => {
        
        let noteCreateTitle = document.querySelector("#noteCreateTitle").value;
        let noteCreateNote = document.querySelector("#noteCreateNote").value;
        let noteCreateTest = document.querySelector("#noteCreateTest").value;
        //Sends a request to the createNote route with the form data given.
        fetch("/createNote", {
            method: "POST", 
            body: JSON.stringify({
                noteCreateTitle: noteCreateTitle,
                noteCreateNote: noteCreateNote,
                noteCreateTest: noteCreateTest
            })
        })
        .then(response => response.json())
        .then(message => {
            const alert = document.createElement("div");
            if(message.message === "Note created.") {
                alert.className = "alert alert-success";
                alert.innerHTML = "Note created successfully!"
                document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
            }
            loadPage("#notesView");
        })
        event.preventDefault();
        
    })
    document.querySelector('#noteEditForm').addEventListener('submit', event => {
        
        let noteEditTitle = document.querySelector("#noteEditTitle").value;
        let noteEditNote = document.querySelector("#noteEditNote").value;
        let noteEditID = document.querySelector("#noteEditID").value;
        //Sends a request to the editNote route with the form data given.
        fetch(`/editNote/${noteEditID}`, {
            method: "POST", 
            body: JSON.stringify({
                noteEditTitle: noteEditTitle,
                noteEditNote: noteEditNote
            })
        })
        .then(response => response.json())
        .then(message => {
            const alert = document.createElement("div");
            if(message.message === "Note edited.") {
                alert.className = "alert alert-success";
                alert.innerHTML = "Note edited successfully!"
                document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
            }
            loadPage("#noteView", note=noteEditID);
        })
        event.preventDefault();
        
    })
    document.querySelector('#noteCreateNote').addEventListener('keyup', event => {
        const noteCreateNote = document.querySelector('#noteCreateNote');
        if (event.keyCode == 13) noteCreateNote.value = noteCreateNote.value + "<br/>"+`\n`;
        //Get the RAW markdown content from the form input.
        let markdownContent = noteCreateNote.value;
        //Convert the data into html
        let htmlContent = converter.makeHtml(markdownContent);
        //Display the html in a div element.
        document.querySelector('#markdownPreview').innerHTML = htmlContent;
        
    })

    document.querySelector('#noteEditNote').addEventListener('keyup', event => {
        const noteEditNote = document.querySelector('#noteEditNote');
        if (event.keyCode == 13) noteEditNote.value = noteEditNote.value + "<br/>"+"\n";
        //Get the RAW markdown content from the form input.
        let markdownContent = noteEditNote.value;
        //Convert the data into html
        let htmlContent = converter.makeHtml(markdownContent);
        //Display the html in a div element.
        document.querySelector('#editMarkdownPreview').innerHTML = htmlContent;
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

//Clears the input values when needed.
function clearFilter(...args) {
    args[0].forEach(arg => {
        document.querySelector(`#${arg}`).value = '';
    })
}

function loadPage(page, note=null) {
    document.querySelector("#notesView").innerHTML = '  ';
    document.querySelector("#noteView").innerHTML = '';

    if (page === "#notesView") {
        clearFilter(["noteFilterInput", "noteFilterSubject", "noteFilterDate"]);
        document.querySelector("#subjects").innerHTML = '';
        document.querySelector("#noteCreateTitle").value = '';
        document.querySelector("#noteCreateNote").value = '';
        document.querySelector("#noteCreateTest").value = '';
        show(["#notesView","#noteCreate", "#notesViewHead"]);
        hide(["#noteView","#noteEdit"]);
        fetch("/getNotes")
        .then(response => response.json())
        .then(message => {
            message.tests.forEach(test => {
                let option = document.createElement('option');
                option.value = test.name;
                option.innerHTML = test.name;
                document.querySelector("#tests").append(option);
            });

            let counter = 0;
            message.notes.forEach(note => {
                //Creates a card view for each study note that has been returned.
                if (note.title.includes(document.querySelector("#noteFilterInput").value)){
                    let card = document.createElement("div");
                    let br = document.createElement('br');
                    card.className = "card noteDisplay";
                    let name = createHTMLElement(element="h2",className=null,html=note.title);
                    name.id = counter;
                    let date = createHTMLElement(element='p',className='text-secondary',html=`Created: ${note.dateOfCreation}`);
                    date.id = `${counter}${note.dateOfCreation}`
                    let test = createHTMLElement(element='p',className="text-secondary",html=null);
                    if(note.test != null){
                        test.innerHTML = `Test: ${note.test}/ Subject: ${note.subject}`;
                    }
                    let school = createHTMLElement(element='p',className="text-secondary",innerHTML=`School: ${note.school}`);
                    let creator = createHTMLElement(element='p',className="text-secondary",html=`Created By: ${note.creator}`);
                    let viewIcon = document.createElement('i')
                    viewIcon.className = 'fas fa-eye'
                    let viewBtn = createHTMLElement(element="button",className='btn btn-outline-secondary',html='View This Note ');
                    viewBtn.append(viewIcon)
                    viewBtn.addEventListener('click', () => {
                        loadPage("#noteView", note=note.id);
                    })
                    let cardBody = document.createElement("div");
                    if(note.subject) {
                        let subject = createHTMLElement(element='p', className=null, html=null)
                        subject.id = `${counter}${note.subject}`
                        cardBody.append(subject)
                    }
                        
                    cardBody.className = "card-body text-center";
                    cardBody.append(name,date,test,school,creator,viewBtn);
                    card.append(cardBody);
                        
                    document.querySelector("#notesView").append(card,br)
                } 
                counter++;
            })

            message.subjects.forEach(subject => {
                let option = document.createElement('option')
                option.value = subject.subject
                document.querySelector("#subjects").append(option)
            });

            //Filter Listeners:
            document.querySelector("#noteFilterInput").addEventListener('keyup', () => {
                clearFilter(["noteFilterSubject", "noteFilterDate"]);
                let filterExists = false;
                //Loops through all the study notes currently shown.
                for(let i = 0; i <= document.querySelectorAll('.noteDisplay').length;i++) {
                    //If the query matches one of the results, it stays visible.
                    if(document.getElementById(`${i}`).innerHTML.includes(document.querySelector("#noteFilterInput").value)){
                        document.getElementById(`${i}`).parentElement.parentElement.style.visibility = "visible";
                        document.getElementById(`${i}`).parentElement.parentElement.style.height = "100%";
                        filterExists = true;
                    //Else: it hides the element.
                    } else {
                        document.getElementById(`${i}`).parentElement.parentElement.style.visibility = "hidden";
                        document.getElementById(`${i}`).parentElement.parentElement.style.height = 0;
                    }
                    //Using a boolean variable, if there were no results that matched the user's query, and alert will show up to tell them.
                    if(!filterExists) {
                        if(document.querySelector(".filterNonAlert")) {
                            const alert = document.querySelector(".filterNonAlert");
                            alert.innerHTML = "No results match your search!"
                        } else {
                        const alert = document.createElement("div");
            
                        alert.className = "alert alert-warning filterNonAlert";
                        alert.innerHTML = "No results match your search!"
                        document.querySelector("#notesView").insertBefore(alert, document.querySelector("#notesView").firstChild);
                        }
                    } else {
                        if(document.querySelector(".filterNonAlert")) {
                            const alert = document.querySelector(".filterNonAlert");
                            alert.remove();
                        } else {}
                    }
                }   
            })
            //
            document.querySelector("#noteFilterSubject").addEventListener('input', () => {
                clearFilter(["noteFilterInput", "noteFilterDate"]);
                let filterExists = false;
                for(let i = 0; i < document.querySelectorAll('.noteDisplay').length;i++) {
                    //If the query matches one of the results, it stays visible.
                    if(document.getElementById(`${i}${document.querySelector("#noteFilterSubject").value}`)){
                        document.getElementById(`${i}`).parentElement.parentElement.style.visibility = "visible";
                        document.getElementById(`${i}`).parentElement.parentElement.style.height = "100%";
                        filterExists = true;
                     //Else: it hides the element.
                    } else {
                        document.getElementById(`${i}`).parentElement.parentElement.style.visibility = "hidden";
                        document.getElementById(`${i}`).parentElement.parentElement.style.height = 0;
                    }
                    //Using a boolean variable, if there were no results that matched the user's query, and alert will show up to tell them.
                    if(!filterExists) {
                        if(document.querySelector(".filterNonAlert")) {
                            const alert = document.querySelector(".filterNonAlert");
                            alert.innerHTML = "No results match your search!"
                        } else {
                            const alert = document.createElement("div");
                
                            alert.className = "alert alert-warning filterNonAlert";
                            alert.innerHTML = "No results match your search!"
                            document.querySelector("#notesView").insertBefore(alert, document.querySelector("#notesView").firstChild);
                        }
                    } else {
                        if(document.querySelector(".filterNonAlert")) {
                            const alert = document.querySelector(".filterNonAlert");
                            alert.remove();
                        } else {}
                    }
                }
            })
            //
            document.querySelector("#noteFilterDate").addEventListener('input', () => {
                clearFilter(["noteFilterInput", "noteFilterSubject"]);
                let filterExists = false;
                for(let i = 0; i < document.querySelectorAll('.noteDisplay').length;i++) {
                     //If the query matches one of the results, it stays visible.
                     if(document.getElementById(`${i}${document.querySelector("#noteFilterDate").value}`)){
                        document.getElementById(`${i}`).parentElement.parentElement.style.visibility = "visible";
                        document.getElementById(`${i}`).parentElement.parentElement.style.height = "100%";
                        filterExists = true;
                     //Else: it hides the element.
                    } else {
                        document.getElementById(`${i}`).parentElement.parentElement.style.visibility = "hidden";
                        document.getElementById(`${i}`).parentElement.parentElement.style.height = 0;
                    }
                    //Using a boolean variable, if there were no results that matched the user's query, and alert will show up to tell them.
                    if(!filterExists) {
                        if(document.querySelector(".filterNonAlert")) {
                            const alert = document.querySelector(".filterNonAlert");
                            alert.innerHTML = "No results match your search!"
                        } else {
                        const alert = document.createElement("div");
            
                        alert.className = "alert alert-warning filterNonAlert";
                        alert.innerHTML = "No results match your search!"
                        document.querySelector("#notesView").insertBefore(alert, document.querySelector("#notesView").firstChild);
                        }
                    } else {
                        if(document.querySelector(".filterNonAlert")) {
                            const alert = document.querySelector(".filterNonAlert");
                            alert.remove();
                        } else {}
                    }
                }
            })
           
            
        })
    } if (page === "#noteView") {
        show(["#noteView"]);
        hide(["#notesView","#noteCreate","#noteEdit", "#notesViewHead"]);

        fetch(`/getNote/${note}`)
        .then(response => response.json())
        .then(message => {
            let NoteTest = "Empty";
            let NoteSubject = "Empty";
            if(message.note.test) NoteTest = message.note.test;
            if(message.note.subject) NoteSubject = message.note.subject;
            let br = document.createElement('br');
            document.querySelector("#noteView").innerHTML = `<hr><h2 class="text-primary text-center">${message.note.title}</h2>`;

            let name = createHTMLElement(element='p', className="text-secondary text-center",html=`Created By: ${message.note.creator}`);
            let date = createHTMLElement(element='p', className="text-secondary text-center",html=`Created: ${message.note.dateOfCreation}`);
            let test = createHTMLElement(element='p', className="text-secondary text-center",html=`Test: ${NoteTest}`);
            let subject = createHTMLElement(element='p', className="text-secondary text-center",html=`Subject: ${NoteSubject}`);
            let school = createHTMLElement(element='p', className="text-secondary text-center",html=`School: ${message.note.school}`);
            let content = createHTMLElement(element='p', className="text-center",html=`School: ${message.note.school}`);
            content.style.border = "1px gray solid";
            content.style.background = "#eeeeee";
            content.style.border =  "0.5px dotted black";
            content.style.borderRadius = "5px";
            content.style.padding = "10px";
            content.innerHTML = message.content;
            let row = document.createElement('div')
            row.className = 'row'
            let firstCol = document.createElement('div')
            firstCol.className = 'col-sm'
            let secCol = document.createElement('div')
            secCol.className = 'col-sm'
            let triCol = document.createElement('div')
            triCol.className = 'col-sm'
            let editIcon = document.createElement('i')
            editIcon.className = 'fas fa-edit'
            let editBtn = createHTMLElement(element='button', className="btn btn-outline-warning m-1 form-control",html="Edit This Study Note. ");
            editBtn.append(editIcon)
            editBtn.addEventListener('click', () => {
                loadPage("#noteEdit", note=message.note.id);
            })
            let backIcon = document.createElement('i')
            backIcon.className = 'fas fa-arrow-alt-circle-left'
            let backBtn = createHTMLElement(element='button', className="btn btn-outline-success m-1 form-control",html="Go back. ");
            backBtn.append(backIcon)
            backBtn.addEventListener('click', () => {
                loadPage("#notesView");
            })
            let delIcon = document.createElement('i')
            delIcon.className = 'fas fa-trash'
            let delBtn = createHTMLElement(element='button', className="btn btn-outline-danger m-1 form-control",html="Delete this Study Note. ");
            delBtn.append(delIcon)
            delBtn.addEventListener('click', () => {
                //Confirms with the user before deleting the study note (must be the creator; otherwise, the button and the request will not work.)
                let isDelete = confirm("Are you sure you want to delete this study note? You won't be able to recover it!")
                if(isDelete){
                    fetch(`/removeNote/${message.note.id}`)
                    .then(response => response.json())
                    .then(message => {
                        const alert = document.createElement("div");
                        if(message.message === "Note removed.") {
                            alert.className = "alert alert-success";
                            alert.innerHTML = "Note removed successfully!"
                            document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
                        }
                        loadPage("#notesView");
                    })
                }
            })
            firstCol.append(backBtn)
            secCol.append(editBtn)
            if(message.isCreator) triCol.append(delBtn);
            row.append(firstCol,secCol,triCol)
            document.querySelector("#noteView").append(row);
            document.querySelector("#noteView").append(name,date,test,subject,school,br,row)
            document.querySelector("#noteView").append(br,content)
        })
    } if (page === "#noteEdit") {
        show(["#noteEdit"]);
        hide(["#noteView","#notesView","#noteCreate","#notesViewHead"]);

        fetch(`/editNote/${note}`)
        .then(response => response.json())
        .then(message => {
            document.querySelector("#noteEditTitle").value = message.note.title;
            document.querySelector("#noteEditNote").value = message.content;
            document.querySelector("#noteEditTest").value = message.note.test;
            document.querySelector("#noteEditID").value = message.note.id;
             //Get the RAW markdown content from the form input.
            let markdownContent = document.querySelector("#noteEditNote").value;
            //Convert the data into html
            let htmlContent = converter.makeHtml(markdownContent);
            //Display the html in a div element.
            document.querySelector('#editMarkdownPreview').innerHTML = htmlContent;
            let row = document.createElement('div')
            row.className = 'row'
            let firstCol = document.createElement('div')
            firstCol.className = 'col-sm'
            let secCol = document.createElement('div')
            secCol.className = 'col-sm'
            let backBtn = document.querySelector("#NoteEditBackBtn");
            backBtn.addEventListener('click', () => {
                loadPage("#noteView", note=message.note.id);
            })
            let saveBtn = document.querySelector("#noteEditSaveBtn");
            firstCol.append(backBtn)
            secCol.append(saveBtn)
            row.append(firstCol,secCol)
            document.querySelector("#noteEdit").append(row)
        })
    }
    
}