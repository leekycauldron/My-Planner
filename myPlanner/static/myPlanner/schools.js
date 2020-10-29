document.addEventListener('DOMContentLoaded', () => {
    reloadPage("#schoolView");
    document.querySelector("#schoolCreateForm").addEventListener('submit', event => {
        //Get form data.
        const schoolCreateName = document.querySelector("#schoolCreateName").value;
        const schoolCreatePass = document.querySelector("#schoolCreatePass").value;
        const schoolCreatePassConf = document.querySelector("#schoolCreatePassConf").value;

        //Send POST request to server w/ form data.
        fetch("/createSchool", {
            method: "POST",
            body: JSON.stringify({
                schoolCreateName: schoolCreateName,
                schoolCreatePass: schoolCreatePass,
                schoolCreatePassConf: schoolCreatePassConf
            })
        })
        .then(response => response.json())
        .then(message => {
            const alert = document.createElement("div");
            
            if(message.error === "There was an error.") {
                alert.className = "alert alert-warning";
                alert.innerHTML = "There was an error! Please try again."
                document.querySelector("#schoolCreate").insertBefore(alert, document.querySelector("#schoolCreate").firstChild);
            }
            if(message.message === "School created."){
                alert.className = "alert alert-success";
                alert.innerHTML = "School Created!";
                document.querySelector("#schoolCreate").insertBefore(alert, document.querySelector("#schoolCreate").firstChild);
            }
            reloadPage("#schoolCreate");
            reloadPage("#schoolView");
        })

        event.preventDefault();
    })

    document.querySelector("#schoolJoinForm").addEventListener('submit', event => {
        //Get form data.
        const schoolJoinName = document.querySelector("#schoolJoinName").value;
        const schoolJoinPass = document.querySelector("#schoolJoinPass").value;

        //Send POST request to server w/ form data.
        fetch("/joinSchool", {
            method: "POST",
            body: JSON.stringify({
                schoolJoinName: schoolJoinName,
                schoolJoinPass: schoolJoinPass
            })
        })
        .then(response => response.json())
        .then(message => {
            const alert = document.createElement("div");
            if(message.message === "School joined."){
                alert.className = "alert alert-success";
                alert.innerHTML = "School Joined!";
            }
            if(message.error === "Invalid Credentials"){
                alert.className = "alert alert-danger";
                alert.innerHTML = "Invalid Credentials Given. Please try again!";
            }if(message.error === "Kick Timeout."){
                alert.className = "alert alert-danger";
                alert.innerHTML = `You have been removed from this school, please wait until ${message.appealDate} to rejoin this school.`;
            }if(message.error === "School already joined."){
                alert.className = "alert alert-warning";
                alert.innerHTML = `Oops! Looks like you have already joined this school!.`;
            } 
            document.querySelector("#schoolJoin").insertBefore(alert, document.querySelector("#schoolJoin").firstChild);
            reloadPage("#schoolJoin");
            reloadPage("#schoolView");
        })

        event.preventDefault();
    }) 

    document.querySelector("#schoolKickForm").addEventListener('submit', event => {
        //Get form data.
        const schoolKickName = document.querySelector("#schoolKickName").value;
        const schoolKickSchool = document.querySelector("#schoolKickSchool").value;

        //Send POST request to server w/ form data.
        fetch(`kickSchool/${schoolKickSchool}`, {
            method: "POST",
            body: JSON.stringify({
                classmate: schoolKickName
            })
        })
        .then(response => response.json())
        .then(message => {
            console.log(message)
            const alert = document.createElement("div");
            if(message.message === "Person voted."){
                alert.className = "alert alert-success";
                alert.innerHTML = "The person has been voted for.";
                document.querySelector("#schoolVoteKick").insertBefore(alert, document.querySelector("#schoolVoteKick").firstChild);
            }
    
            reloadPage("#schoolKickName");
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

function reloadPage(page, schoolID=null) {
    if (page === "#schoolCreate") {
        //Clear Form
        document.querySelector("#schoolCreateName").value = '';
        document.querySelector("#schoolCreatePass").value = '';
        document.querySelector("#schoolCreatePassConf").value = '';
        
    }if (page === "#schoolJoin") {
        //Clear Form
        document.querySelector("#schoolJoinName").value = '';
        document.querySelector("#schoolJoinPass").value = '';
        
    } if (page === "#schoolView") {
        show(["#schoolCreate", "#schoolJoin", "#schoolView"]);
        hide(["#schoolIndView","#schoolVoteKick"]);

        document.querySelector(page).innerHTML = "<h1>Your Groups: <span class='text-secondary'>(Click on a school to view more information.)</span></h1>"
        fetch("/getSchools")
        .then(response => response.json())
        .then(message => {
            message.message.forEach(school => {
                //Creates a card view for each school that has been returned.
                let card = document.createElement("div");
                let br = document.createElement('br');
                card.className = "card";
                let a = document.createElement('a');
                a.href="#schoolCreate";
                a.addEventListener('click', () => {
                    reloadPage("#schoolIndView", school.id);
                })
                a.innerHTML = `<h2>${school.name}</h2>`;
                let cardBody = document.createElement("div");
                cardBody.className = "card-body text-center";
                cardBody.append(a);
                card.append(cardBody);
                document.querySelector("#schoolView").append(card,br);
            });
        })
    } if (page === "#schoolIndView") {
        hide(["#schoolCreate","#schoolVoteKick","#schoolJoin","#schoolView"]);
        show(["#schoolIndView"]);
        document.querySelector("#schoolIndView").innerHTML = "<h1>Your School Classmates:</h1>"
        fetch(`/getSchool/${schoolID}`)
        .then(response => response.json())
        .then(message => {
            //If more than two people exist in a school, the option to votekick someone will become available.
            if (message.message.length < 2){
                console.log("not eligible for votekicking")
            } else {
                document.querySelector("#schoolVoteKick").style.visibility = "visible";
                document.querySelector("#schoolVoteKick").style.height = "100%";
                document.querySelector("#schoolKickSchool").value = message.currentSchool;
                message.message.forEach(user =>{
                    if (user.user != message.currentUser){
                        let option = document.createElement('option');
                        option.value = user.user
                        option.innerHTML =user.user
                        document.querySelector("#classmates").append(option)
                    } 
                })
                }
            let row = document.createElement('div')
            row.className = 'row'
            let firstCol = document.createElement('div')
            firstCol.className = 'col-sm'
            let secCol = document.createElement('div')
            secCol.className = 'col-sm'
            let leaveIcon = document.createElement('i')
            leaveIcon.className = 'fas fa-sign-out-alt'
            let btn = document.createElement('button');
            btn.className="btn btn-outline-danger form-control";
            btn.innerHTML = "Leave This Class. ";
            btn.append(leaveIcon)
            btn.addEventListener('click', () => {
                let leaveConfirm = confirm("Are you sure you want to leave this class?");
                if(leaveConfirm){
                    fetch(`/leaveSchool/${schoolID}`)
                    .then(response => response.json())
                    .then(message => reloadPage("#schoolView"))
                } 
            })
            let backIcon = document.createElement('i')
            backIcon.className = 'fas fa-arrow-alt-circle-left'
            let backBtn = document.createElement('button');
            backBtn.className="btn btn-outline-success form-control";
            backBtn.innerHTML = `Go Back. `;
            backBtn.append(backIcon)
            backBtn.addEventListener('click', () => {
                reloadPage("#schoolView");
            })
            let br = document.createElement('br');
            message.message.forEach(user => {
                let card = document.createElement("div");
                
                card.className = "card";
                let cardBody = document.createElement("div");
                cardBody.className = "card-body text-center";
                cardBody.innerHTML = `
                <h2>${user.user}</h2>
                `
                card.append(cardBody);
                if(message.currentUser == user.user){

                } else {
                    document.querySelector("#schoolIndView").append(card,br);
                }
                
            })
            firstCol.append(backBtn)
            secCol.append(btn)
            row.append(firstCol,secCol)
            document.querySelector("#schoolIndView").append(row);
        })
    } if (page === "#schoolVoteKick") {
        document.querySelector("#schoolKickName").value = '';
    }

    
}