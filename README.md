# My Planner (Write-Up)
## A School Planner that helps students study for tests.
This project was created for [CS50’s Web Programming with Python and JavaScript](https://cs50.harvard.edu/web/2020/)
<hr>

### A Short Description
This application is for students to help them organize their tests and share study notes with other students. Students can create groups and add others to it. These groups have no one administrator, rather the authority is dispersed among the whole group. To enforce proper moderation in these groups, students have the option to vote someone **out** of the group if they have the need. Passwords in schools can be changed **only** by the original creator of the school. Students in groups can assign tests where everyone in that group can have access to those tests. Study notes *for* those tests can also be created and edited by anyone in the school using the lightweight markup language known as [Markdown ](https://www.markdownguide.org/basic-syntax/)<br><img src="/myPlanner/static/myPlanner/markdown_logo.png" height="100">
***
### The File structure
This project contains several files that make up the entire application.

The main file is the `views.py` file. This File contains all the view functions in this application. Any request that comes to the application, the `views.py` file handles it and returns the appropriate response. The code that handles authentication, tests, schools, notes, and settings are all in here. The logic is also processed here along with security and validating user forms.

My `view.py` file was larger than those of past projects; therefore, I created a `utils.py` file that contained all the logic function for my application. This file is responsible, for the most part, of handling [Markdown ](https://www.markdownguide.org/basic-syntax/)files (A.K.A study notes) such as creation, deletion, and editing.

The HTML files in my projects are dynamic templates that can be manipulated and returned using my `views.py` file. The main HTML file used in this application is the `layout.html` file. This file includes all the CDN packages needed for the frontend and the constant content that would be shown throughout the app, such as the navigation bar.

The `notes` folder in my project contains all the markdown files, also known as study notes, created by users. The unique names of each file are given depending on which study note data cell they relate to. The unique ID of each study note is used to create the markdown file.

The `models.py` folder is where I created my database tables/models. They contain tables for schools, profiles, tests, and notes. These tables are represented by classes that are referenced in my `views.py` file.

The CSS File in my `static` folder contains the styling needed for my application. Although I am using the [Bootstrap ](https://getbootstrap.com/)framework for my styling, I still require a CSS file to customize HTML elements with more specificity.

The Javascript Files in my `static` folder contains the Javascript files in my application. These static files each belong to a different page e.g. the `notes.js` file belongs to the `notes.html` file. Each file is responsible for updating the webpage without doing a full reload of the page to give the user a better experience. Every Javascript file makes a `fetch` request to my web server, currently, my computer, where my `view.py` handles the request and returns a JSON request. The Javascript file then receives the request and updates the webpage without a reload. 
These files are also responsible for making responsive content such as my `live preview` editor ([Powered by Showdown](https://github.com/showdownjs/showdown)) by  listening to user input and updating the DOM in real-time.
***
### Why I think this project satisfies the complexity requirements required

I think that this project meets the requirement because I have utilized Django (with 7 models) on the back-end and Javascript on the front-end, made my application mobile-responsive, and have made this project distinct and more complex than past projects.
***
**The 7 models used:**
1. Subject
    - This model contains all the basic school subjects (9 including an "other" option) that can be added to tests as a tag.
    - **Example**: These subjects can be added to tests and notes to help easily filter through them. Examples of subjects added: English, Mathematics, and Science.
2. School
    - This model contains all the schools/groups in this application. The school can have a name and a password stored using Django's password management system.
    - **Example**: A student can create a group called "Example School Grade 9 Friends" and set a password called "000000", and others can join the school using those credentials.
3. Test
    - This model contains the information needed for students to create a test.
    - A test can have a name, school (relationship with School model), date, and subject (relationship with Subject model)
    - **Example**: A Math test is taking place on 2020-12-25 at "Example School". This would be stored in the database as "Math Test, Example School(School Object), 2020-12-25, Mathematics".
4. voteKicks
    - This model contains information for vote kicking in schools. The information: `user` for the person being voted for, `kicks` for the number of votes the user currently has, and `school` for the school this vote is currently taking place.
    - **EXAMPLE**: If Harry needs to be kicked out of "Hogwarts School", Ron and Hermione can both vote for Harry to be kicked. The database would store this: "Harry(User Object), 2, Hogwarts School(School Object)".
    - More information on vote kicking [here.](#reasoning)
5. appealKick
    - This model if for *after* someone has been kicked from a school. This model contains the `user` for the person that has been kicked, `appealDate` which is 7 days from when the person was removed from the group (date set in `views.py`), and `school` for the school the person was removed from.
    - **EXAMPLE**: If Harry was removed from the group at 2020-12-18, then an `appealKick` would be created with the `appealDate` of 2020-12-25. 
6. Note
    - This model contains the information needed for students to create a study note. This includes the title, date created, test, creator, subject, and school.
    - The markdown file name is dependent on the ID of the study note.
    - **EXAMPLE**: The first-ever study note has been created. First, the information would be stored: "Math Test Study Notes, 2020-09-02, Math Test(Test Object), Hermione(User Object), Mathematics(Subject Object), Hogwarts School(School Object)"
7. Profile
    - This model is created for every user on the platform. It contains information for the schools and tests that are related to the user.
    - This is model is used for filtering and easily displaying information to users.
    - **EXAMPLE**: Ron has created a new account on this platform and a new profile has been created for him. Right now the only thing that occupies this profile is the user field; however, when he joins schools and creates tests, the will be added to his Profile model. 
***
**Mobile-Responsiveness:**

Using the front-end framework known as [Bootstrap ](https://getbootstrap.com/) I was able to easily create a mobile-responsive application. Using Chrome DevTools and window re-sizing, I was able to test the mobile-responsiveness of the application and make sure everything looked as good as it does on a regular computer screen.
***
**Features and Design Aspects That Make This Application More Distinct and Complex Than Past Projects:**

I think that this project is more distinct than past projects because past projects have had one main feature/goal: emailing, posting, or auctioning. This project's main goal is organization when studying and achieving it by factors of several things such as groups, test sharing, and the ability to create and edit study notes with others in the same group. Each factor is different from each other in the sense that each one accomplishes a different goal: groups allow for organization and private sharing, tests allow people to set reminders for each other when they all have tests, and note sharing creates the ability for people to study together without overcomplicating it.

**Features in this project that makes this project more *complex* than past projects**:

<span id="reasoning">**Vote kicking**</span>

While the groups that students make are decentralized without the main administrator, there still needs to be a way to have some order and peace in the groups. This is where vote kicking comes into play. Vote kicking allows everyone to play a part in important decision-making. The current vote kicking system is simple; however, it allows for authority to be spread amongst everyone. For someone to be removed from a group, at least 50% of the people in the group must vote for that person. Once this happens, if the user wants to come back, they must wait 7 days to be allowed to join back. *For more security, the owner of the group can change the password.*

**File Managing**

While this feature has been used in [Project 1](https://cs50.harvard.edu/web/2020/projects/1/wiki/), the method of file management in this project is different from the past one and the method of file naming is different. In project 1, the user would be prompted to name the file. This is good; however, an Integrity Error could occur. This error can be considered an edge case because the purpose of the project was to create an encyclopedia with a large number of unique entries. This is not the case for my project. Since more than 1 school exists in the world, at least 2 people may have the same file name if it were up to them. Due to this, auto-generating a file name seems like the best case, especially since notes can be archived, using the Note Object's Id. Every Note has a different Id/ Primary Key; therefore an Integrity Error would not occur even if two schools have study notes with the same name.

**Test Expiry**

When students create tests and schedule them for a later date, it would be very tedious if they have to check every one of them off. It's supposed to be an event, not a task. Automating this task would be more efficient and improve the user experience. When a user requests to see their tests, in the background, the request goes through all their tests and removes the ones whose date has already passed. This allows the user to have more time creating tests and notes rather than wasting their time removing the ones that have already happened.

**Filtering**

If a student has used the application for a long time, they would build up a lot of study notes. This can be an obstacle when studying because they would have to scroll through a whole list of notes just to find the right one. That is why I have implemented a filter feature that allows the user to filter through all their results and find specific notes. This feature was built completely on the front-end using Javascript. Users can filter their study notes based on the title, the subject, or the date.

**Use of front-end libraries**

Most projects in this course have used [Bootstrap ](https://getbootstrap.com/) as the front-end framework; however, not many other front-end libraries have been used. The libraries that I have used in this project have helped me create better user interfaces and create my `study note live preview*.

1. [Font Awesome](https://fontawesome.com/)

Font Awesome is more of a toolkit; however, it has helped me efficiently utilize icons.

2. [Showdown](https://github.com/showdownjs/showdown)

Showdown is a free library that can be used as a Markdown to HTML converter that can be used client-side or server-side. Due to its ability to be used on the browser, I found this library extremely helpful to create a smooth live editor without weird reloads or changes to the webpage. 

**Markdown Editor**

This editor is extremely helpful when creating study notes especially since markdown isn't a common syntax used by most people. 
Live Preview ([Powered by Showdown](https://github.com/showdownjs/showdown)) allows users to see the results of what they are typing in markdown without a complete refresh of the page. This method allows users to fix syntactical errors without having to edit their notes.
The Markdown Editor also automatically detects when a user wants to create a new paragraph and creates a `<br>` HTML element to create a line break.

***
### Requirements.txt

The packages needed to run this project are located in [requirements.txt](/requirements.txt).
***
### Final Notes
#### Free Third-party Libraries Used:

- Showdown - https://github.com/showdownjs/showdown
- Font Awesome - https://fontawesome.com/
- Bootstrap - https://getbootstrap.com/
- Markdown2 - https://github.com/trentm/python-markdown2

#### This was Web Programming with Python and JavaScript.