document.addEventListener('DOMContentLoaded', () => {
    loadpage();
    document.querySelector("#profileForm").addEventListener('submit', event => {
        let username = document.querySelector("#username").value;
        let passChange = document.querySelector("#passChange").value;
        let password = document.querySelector("#password").value;
        let passChangeConf = document.querySelector("#passChangeConf").value;
        //Sends a request to the config route with a method of 1.
        fetch('config/1', {
            method: "POST",
            body: JSON.stringify({
                username: username,
                passChange: passChange,
                password: password,
                passChangeConf: passChangeConf
            })
        })
        .then(response => response.json())
        .then(message => {
            //Callback Alerts.
            const alert = document.createElement("div");
            if(message.error === "Incorrect Password"){
                alert.className = "alert alert-danger";
                alert.innerHTML = "Invalid Credentials, please try again."
                document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
                
            } else if(message.error === "Passwords do not match.") {
                alert.className = "alert alert-danger";
                alert.innerHTML = "Password do not match, please try again."
                document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
            }else {
                alert.className = "alert alert-success";
                alert.innerHTML = "User successfully updated."
                document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
            }
            loadpage()
        })
        event.preventDefault();
    })
    document.querySelector("#schoolPassForm").addEventListener('submit', event => {
        let school = document.querySelector("#school").value;
        let schoolPassChange = document.querySelector("#schoolPassChange").value;
        let schoolPass = document.querySelector("#schoolPass").value;
        let schoolPassChangeConf = document.querySelector("#schoolPassChangeConf").value;
        //Sends a request to the config route with a method of 1.
        fetch('config/2', {
            method: "POST",
            body: JSON.stringify({
                school: school,
                schoolPassChange: schoolPassChange,
                schoolPass: schoolPass,
                schoolPassChangeConf: schoolPassChangeConf
            })
        })
        .then(response => response.json())
        .then(message => {
            //Callback Alerts.
            const alert = document.createElement("div");
            if(message.error === "School does not exist."){
                alert.className = "alert alert-warning";
                alert.innerHTML = "The school you have chosen does not exist, please try again."
                document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
                
            } else if(message.error === "Incorrect Password") {
                alert.className = "alert alert-danger";
                alert.innerHTML = "Invalid Credentials, please try again."
                document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
            }else if(message.error === "Passwords do not match.") {
                alert.className = "alert alert-danger";
                alert.innerHTML = "Password do not match, please try again."
                document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
            } else {
                alert.className = "alert alert-success";
                alert.innerHTML = "School password successfully updated."
                document.querySelector("#alert-section").insertBefore(alert, document.querySelector("#alert-section").firstChild);
            }
            loadpage()
        })
        //Sends a request to the config route with a method of 2.
        event.preventDefault();
    })
})



function loadpage() {
    //Fetch the needed information to autofill some settings form inputs.
    fetch("/config/0")
    .then(response => response.json())
    .then(message => {
        //Add the information gained to the needed form inputs and clear the rest.
        document.querySelector("#username").value = message.username;
        document.querySelector("#passChange").value = '';
        document.querySelector("#passChangeConf").value = '';
        document.querySelector("#password").value = '';

        document.querySelector("#school").value = '';
        document.querySelector("#schools").innerHTML = '';
        message.ownedSchools.forEach(school => {
            let option = document.createElement('option');
            option.value = school.name;
            option.innerHTML = school.name;
            document.querySelector("#schools").append(option);
        });
        document.querySelector("#schoolPassChange").value = '';
        document.querySelector("#schoolPassChangeConf").value = '';
        document.querySelector("#schoolPass ").value = '';
        document.querySelector(".navbar-brand").innerHTML = `My Planner (${message.username})`;
    })

}