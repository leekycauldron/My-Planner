#Import Packages.
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from .models import *
import json, datetime, pytz, markdown2
from django.contrib.auth.hashers import make_password, check_password
from .utils import *

# Create your views here.
def index(request):
    try:
        currentUser = User.objects.get(username=request.user)
    except:
        return render(request, "myPlanner/index.html")
    currentProfile = Profile.objects.get(user=currentUser)
    currentSchools = [school.id for school in currentProfile.schools.all()]
    currentTests = currentProfile.tests.all()
    #Goes through all of the users tests and deletes the ones that have already happened.
    for test in currentTests:
        testDate = test.date.replace(tzinfo=pytz.utc)
        dateNow = dateNowFormat()
        nowDate = dateNow.replace(tzinfo=pytz.utc)
        if testDate < nowDate:
            test.delete()

    currentTests = Test.objects.filter(school__in=currentSchools)

    tests = currentProfile.tests.all()
    availableTests = []
    for test in tests:
        if not Note.objects.filter(test=test).exists():
            availableTests.append(test.serialize())

    #Gets and sorts the user's notes/tests by date.
    notes = Note.objects.filter(school__in=currentSchools)
    currentTests = currentTests.order_by("date")
    notes = notes.order_by("-date")
    return render(request, "myPlanner/index.html", {
        "tests": [test.serialize() for test in currentTests[:3]],
        "schools": [school.serialize() for school in currentProfile.schools.all()[:3]],
        "notes": [note.serialize() for note in notes[:3]]
    })

@login_required(login_url="err")
def schools(request):
    return render(request, "myPlanner/schools.html")
@login_required(login_url="err")
def tests(request):
    return render(request, "myPlanner/tests.html")

@login_required(login_url="err")
def notes(request):
    return render(request, "myPlanner/notes.html")

def err(request):
    return render(request, "myPlanner/err.html")
@login_required(login_url="err")
def settings(request):
    return render(request, "myPlanner/settings.html")
#####AUTHENTICATION#####
def loginPage(request):
    if request.method == "POST":

        #Get User credentials from form and attempt to authenticate.
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        #Shows the index page if login is successful; otherwise, returns the same page with an error message.
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "myPlanner/login.html", {
                "message": "Invalid credentials, please try again."
            })
    else:
        return render(request, "myPlanner/login.html")


def logoutPage(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"), {
        "logout_message": "You have been logged out."
    })


def register(request):
    if request.method == "POST":
        #Collect user credentials from form.
        username = request.POST["username"]
        #Returns same page with error if password and confirmation don't match.
        password = request.POST["password"]
        confirm = request.POST["pass2"]
        if password != confirm:
            return render(request, "myPlanner/register.html", {
                "message": "Passwords must match."
            })

        #Creates a User and a Profile model; returns an error if unsuccessful.
        try:
            user = User.objects.create_user(username, password)
            user.save()
            profile = Profile(user=user)
            profile.save()
        except IntegrityError:
            return render(request, "myPlanner/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "myPlanner/register.html")

####API ROUTES####
@csrf_exempt
def config(request,method):
    #Get the needed information to autofill some input fields in the settings page.
    currentUser = User.objects.get(username=request.user)
    ownedSchools = School.objects.filter(owner=currentUser)
    if request.method == "POST":
        if method == 1:
            username = json.loads(request.body).get("username")
            passChange = json.loads(request.body).get("passChange")
            password = json.loads(request.body).get("password")
            passChangeConf = json.loads(request.body).get("passChangeConf")
            #Makes sure the passwords match.
            if passChange != passChangeConf:
                 return JsonResponse({"error": "Passwords do not match."}, status=400)
            #Verifies the user.
            hasPass = check_password(password,currentUser.password) 
            if not hasPass:
                return JsonResponse({"error": "Incorrect Password"}, status=401)
            #Updates the current User.
            currentUser.username = username
            if passChange != '':
                hashed_pwd = make_password(passChange)
                currentUser.password = hashed_pwd
            currentUser.save()
            login(request, currentUser)
            return JsonResponse({"message": "User updated."})

        if method == 2:
            school = json.loads(request.body).get("school")
            schoolPassChange = json.loads(request.body).get("schoolPassChange")
            schoolPass = json.loads(request.body).get("schoolPass")
            schoolPassChangeConf = json.loads(request.body).get("schoolPassChangeConf")
            #Makes sure the passwords match.
            if schoolPassChange != schoolPassChangeConf:
                 return JsonResponse({"error": "Passwords do not match."}, status=400)
            #Verifies the School
            currentSchool = None
            try:
                currentSchool = School.objects.get(name=school)
            except:
                return JsonResponse({"error": "School does not exist."}, status=400)
            hasSchoolPass = check_password(schoolPass,currentSchool.password)
            if not hasSchoolPass:
                return JsonResponse({"error": "Incorrect Password"}, status=401)
            #Updates the School Password
                hashed_pwd = make_password(schoolPassChange)
                currentSchool.password = hashed_pwd
                currentSchool.save()
            return JsonResponse({"message": "School updated."})

        return JsonResponse({"error": "Invalid method given."}, status=400)
    return JsonResponse({
        "username": currentUser.username,
        "ownedSchools": [ownedSchool.serialize() for ownedSchool in ownedSchools]
    })

@csrf_exempt
def createSchool(request):
    currentUser = User.objects.get(username=request.user)
    currentProfile = Profile.objects.get(user=currentUser)
    if request.method == "POST":
        schoolCreateName = json.loads(request.body).get("schoolCreateName")
        schoolCreatePass = json.loads(request.body).get("schoolCreatePass")
        schoolCreatePassConf = json.loads(request.body).get("schoolCreatePassConf")

        if not schoolCreatePass == schoolCreatePassConf:
            return JsonResponse({"error": "There was an error."}, status=400)

        #Uses Django's has alogrithm to create a hased password and save it to a School model.
        hashed_pwd = make_password(schoolCreatePassConf)
        try:
            schoolCreation = School(name=schoolCreateName, password=hashed_pwd, owner=currentUser)
            schoolCreation.save()
        except IntegrityError:
            return JsonResponse({"error": "There was an error."})
       
        currentProfile.schools.add(schoolCreation)
        currentProfile.save()
        return JsonResponse({"message": "School created."})
    return JsonResponse({"error": "POST request required."}, status=400)

@csrf_exempt
def joinSchool(request):
    if request.method == "POST":
        schoolJoinName = json.loads(request.body).get("schoolJoinName")
        schoolJoinPass = json.loads(request.body).get("schoolJoinPass")

        currentUser = User.objects.get(username=request.user)
        currentProfile = Profile.objects.get(user=currentUser)
        
        if not School.objects.filter(name=schoolJoinName).exists():
            return JsonResponse({"error": "Invalid Credentials"})
        
        #If the user has already joined the current school, an error is returned.
        schoolJoin = School.objects.get(name=schoolJoinName)
        isJoined = False
        for school in currentProfile.schools.all():
            if school == schoolJoin:
                isJoined = True

        if isJoined:
            return JsonResponse({"error": "School already joined."}, status=400)
        #After a person has been kicked from the school, they must wait 7 days before rejoining, if they attempt to rejoin it will return an error.
        if appealKick.objects.filter(user=currentUser, school=schoolJoin).exists():
            voteKickProfile = voteKicks.objects.get(user=currentUser, school=schoolJoin)
            appealProf = appealKick.objects.get(user=currentUser, school=schoolJoin)
            dateOfAppeal = appealProf.appealDate
            dateOfAppeal = dateOfAppeal.strftime(f"%Y-%m-%d")
            dateOfAppeal = datetime.datetime.strptime(dateOfAppeal, f"%Y-%m-%d")
            dateNow = dateNowFormat()
            if dateNow < dateOfAppeal:
                return JsonResponse({"error": "Kick Timeout.", "appealDate": dateOfAppeal.strftime(f"%Y-%m-%d")})
            else: 
                appealProf.delete()
                voteKickProfile.delete()

        schoolPass = schoolJoin.password
        hasPass = check_password(schoolJoinPass,schoolPass) 
        if hasPass:
            currentProfile.schools.add(schoolJoin)
            currentProfile.save()
        else: 
            return JsonResponse({"error": "Invalid Credentials"})
        return JsonResponse({
            "message": "School joined."
        })

    return JsonResponse({"error": "POST request required."}, status=400)

def getSchools(request):
    currentUser = User.objects.get(username=request.user)
    currentProfile = Profile.objects.get(user=currentUser)

    return JsonResponse({"message": [school.serialize() for school in currentProfile.schools.all()]})

def getSchool(request, school):
    currentSchool = School.objects.get(id=school)
    usersInSchool = Profile.objects.filter(schools=currentSchool)
    return JsonResponse({"message": [user.serialize() for user in usersInSchool], "currentUser": str(request.user), "currentSchool": currentSchool.name})

def leaveSchool(request,school):
    currentUser = User.objects.get(username=request.user)
    currentProfile = Profile.objects.get(user=currentUser)
    currentSchool = School.objects.get(id=school)
    curretSchoolOwner = currentSchool.owner
    currentProfile.schools.remove(currentSchool)
    currentProfile.save()
    if not Profile.objects.filter(schools=currentSchool).exists():
        currentSchool.delete()
    return JsonResponse({"message": "School left."})

@csrf_exempt
def kickSchool(request, school):
    if request.method == "POST":
        

        kickee = json.loads(request.body).get("classmate")
        kickeeUser = User.objects.get(username=kickee)
        kickeeProfile = Profile.objects.get(user=kickeeUser)

        currentSchool = School.objects.get(name=school)
        currentSchoolPersonCount = Profile.objects.filter(schools=currentSchool).count()

        voteKickProfile = voteKicks(user=kickeeUser, school=currentSchool)
        voteKickProfile.save()

        voteKickProfile = voteKicks.objects.get(user=kickeeUser)
        voteKickProfile.kicks = voteKickProfile.kicks + 1
        voteKickProfile.save()
        #If at least 50% of the people in the school have voted for one person, they will be removed from the school and given a 7 day cooldown.
        if voteKickProfile.kicks >= currentSchoolPersonCount / 2:
            kickeeProfile.schools.remove(currentSchool)
            kickeeProfile.save()
            dateOfAppeal = datetime.datetime.now() + datetime.timedelta(days=7)
            appealKickProfile = appealKick(school=currentSchool, user=kickeeUser, appealDate=dateOfAppeal)
            appealKickProfile.save()
        return JsonResponse({"message": "Person voted."})
    return JsonResponse({"error": "POST request required"}, status=400)

def getTests(request):
    currentUser = User.objects.get(username=request.user)
    currentProfile = Profile.objects.get(user=currentUser)
    currentSchools = [school.id for school in currentProfile.schools.all()]
    currentTests = Test.objects.all()
    #Goes through all of the users tests and deletes the ones that have already happened.
    for test in currentTests:
        testDate = test.date.replace(tzinfo=pytz.utc)
        dateNow = dateNowFormat()
        nowDate = dateNow.replace(tzinfo=pytz.utc)
        if testDate < nowDate:
            test.delete()

    currentTests = Test.objects.filter(school__in=currentSchools)

    currentTests = currentTests.order_by("date")
    return JsonResponse({
        "subjects": [subject.serialize() for subject in Subject.objects.all()],
        "schools":  [school.serialize() for school in currentProfile.schools.all()],
        "tests": [test.serialize() for test in currentTests]
    })

@csrf_exempt
def createTest(request):
    if request.method == "POST":
        testCreateName = json.loads(request.body).get("testCreateName")
        testCreateSchool = json.loads(request.body).get("testCreateSchool")
        testCreateTime = json.loads(request.body).get("testCreateTime")
        testCreateSubject = json.loads(request.body).get("testCreateSubject")

        currentSchool = School.objects.get(name=testCreateSchool)
        currentSubject = Subject.objects.get(subject=testCreateSubject)
        #Makes sure the date set by the user is not before the current date.
        dateSet = datetime.datetime.strptime(testCreateTime, f"%Y-%m-%d")
        dateNow = dateNowFormat()
        if dateSet < dateNow:
            return JsonResponse({"error": "Date Error."}, status=400)
        
        testCreation = Test(subject=currentSubject, name=testCreateName, school=currentSchool, date=testCreateTime)
        testCreation.save()

        currentUser = User.objects.get(username=request.user)
        currentProfile = Profile.objects.get(user=currentUser)
        currentProfile.tests.add(testCreation)
        currentProfile.save()
   

        return JsonResponse({"message": f"Test created."})
    return JsonResponse({"error": "POST request required."}, status=400)


@csrf_exempt
def editTest(request, test):
    currentUser = User.objects.get(username=request.user)
    currentProfile = Profile.objects.get(user=currentUser)
    currentTest = Test.objects.get(id=test)
    if request.method == "POST":
        #Get Form Data.
        testEditName = json.loads(request.body).get("testEditName")
        testEditSchool = json.loads(request.body).get("testEditSchool")
        testEditTime = json.loads(request.body).get("testEditTime")
        testEditSubject = json.loads(request.body).get("testEditSubject")
        #Makes sure the date set by the user is not before the current date.
        dateSet = datetime.datetime.strptime(testEditTime, f"%Y-%m-%d")
        dateNow = dateNowFormat()
        if dateSet < dateNow:
            return JsonResponse({"error": "Date Error."}, status=400)

        currentSchool = School.objects.get(name=testEditSchool)
        currentSubject = Subject.objects.get(subject=testEditSubject)

        currentTest.name = testEditName
        currentTest.school = currentSchool
        currentTest.date = testEditTime
        currentTest.subject = currentSubject
        currentTest.save()
        
        return JsonResponse({"message": "Test edited."})
    return JsonResponse({
        "message": currentTest.serialize(),
        "subjects": [subject.serialize() for subject in Subject.objects.all()],
        "schools":  [school.serialize() for school in currentProfile.schools.all()]
        })

@csrf_exempt
def createNote(request):
    if request.method == "POST":
        currentUser = User.objects.get(username=request.user)
        #Get Form Data.
        noteCreateTitle = json.loads(request.body).get("noteCreateTitle")
        noteCreateNote = json.loads(request.body).get("noteCreateNote") or None
        noteCreateTest = json.loads(request.body).get("noteCreateTest")

        if noteCreateNote == None: 
            return JsonResponse({"error": "Empty Note."}, status=400)
        currentTest = Test.objects.get(name=noteCreateTest)
        currentSchool = School.objects.get(name=currentTest.school.name)
        currentSubject = currentTest.subject
        noteCreation = Note(title=noteCreateTitle,test=currentTest, creator=currentUser, school=currentSchool, subject=currentSubject)
        noteCreation.save()
        #Creates a markdown file with a file name of the note id.
        noteFileCreation = uploadfile(content=noteCreateNote, filename=noteCreation.id)

        if not noteFileCreation:
            return JsonResponse({"error": "File Already Exists."}, status=400)

        return JsonResponse({"message": f"Note created."})
    return JsonResponse({"error": "POST request required."}, status=400)

def getNotes(request):

    currentUser = User.objects.get(username=request.user)
    currentProfile = Profile.objects.get(user=currentUser)
    currentSchools = [school.id for school in currentProfile.schools.all()]
    tests = Test.objects.filter(school__in=currentSchools)
    availableTests = []
    #Gets the tests in the user's school(s) that don't already have a study note associated with them.
    for test in tests:
        if not Note.objects.filter(test=test).exists():
            availableTests.append(test.serialize())

    currentSchools = [school.id for school in currentProfile.schools.all()]

    notes = Note.objects.filter(school__in=currentSchools)
    subjects = Subject.objects.all()
    return JsonResponse({
        "tests":  availableTests, 
        "notes": [note.serialize() for note in notes],
        "subjects": [subject.serialize() for subject in subjects]
        })

def getNote(request, id):
    try:
        currentTest = Note.objects.get(id=id)
    except:
        return JsonResponse({"error": "Exist Error."}, status=400)

    noteContent = getFile(filename=currentTest.id)
    if not noteContent:
        return JsonResponse({"error": "There was an error."}, status=500)
    #Gets the markdown file and converts it to html to be able to be displayed on the webpage.
    noteContent = markdown2.markdown(noteContent)
    isCreator = str(request.user) == str(currentTest.creator.username)
    return JsonResponse({
        "note": currentTest.serialize(),
        "content": noteContent,
        "isCreator": isCreator
    })

@csrf_exempt
def editNote(request,id):
    currentUser = User.objects.get(username=request.user)
    currentProfile = Profile.objects.get(user=currentUser)  
    currentTest = Note.objects.get(id=id)
    noteContent = getFile(filename=currentTest.id)
    if not noteContent:
        return JsonResponse({"error": "There was an error."}, status=500)

    if request.method == "POST":
        noteEditTitle = json.loads(request.body).get("noteEditTitle")
        noteEditNote = json.loads(request.body).get("noteEditNote") or None

        currentNote = Note.objects.get(id=id)
        currentNote.title = noteEditTitle
        currentNote.save()
        #Changes the contents of the study note markdown file.
        editFile(filename=currentNote.id,content=noteEditNote)
        return JsonResponse({"message": f"Note edited."})
    return JsonResponse({
        "note": currentTest.serialize(),
        "content": noteContent
    })

def removeNote(request, id):
    currentNote = Note.objects.get(id=id)
    #Checks if the person removing the note is the creator, then proceeds to remove the note entirely.
    if str(request.user) == str(currentNote.creator.username):
        removeFile(currentNote.id)
        currentNote.delete()
        return JsonResponse({"message": f"Note removed."})
    else:
        return JsonResponse({"error": f"This request method is not allowed."}, status=405)