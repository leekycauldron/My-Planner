from django.urls import path, include

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.loginPage, name="login"),
    path("logout", views.logoutPage, name="logout"),
    path("register", views.register, name="register"),
    path("schools", views.schools, name="schools"),
    path("tests", views.tests, name="tests"),
    path("notes", views.notes, name="notes"),
    path("err", views.err, name="err"),
    path("settings", views.settings, name="settings"),

    ####API ROUTES####
    path("createSchool", views.createSchool, name="createSchool"),
    path("joinSchool", views.joinSchool, name="joinSchool"),
    path("getSchools", views.getSchools, name="getSchools"),
    path("getSchool/<str:school>", views.getSchool, name="getSchool"),
    path("leaveSchool/<str:school>", views.leaveSchool, name="leaveSchool"),
    path("kickSchool/<str:school>", views.kickSchool, name="kickSchool"),

    path("getTests", views.getTests, name="getTests"),
    path("createTest", views.createTest, name="createTest"),
    path("editTest/<int:test>", views.editTest, name="editTest"),

    path("createNote", views.createNote, name="createNote"),
    path("getNotes", views.getNotes, name="getNotes"),
    path("getNote/<int:id>", views.getNote, name="getNote"),
    path("editNote/<int:id>", views.editNote, name="editNote"),
    path("removeNote/<int:id>", views.removeNote, name="removeNote"),

    path("config/<int:method>", views.config, name="config")
]
