from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime

# Create your models here.
class User(AbstractUser):
    pass

class Subject(models.Model):
    subject = models.CharField(max_length=64, blank=False)
    def serialize(self):
        return {
            "subject": self.subject
        }

class School(models.Model):
    name = models.CharField(max_length=64, blank=False, unique=True)
    password = models.CharField(max_length=128, blank=False)
    owner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "owner": self.owner.username  
        }

class Test(models.Model):
    name = models.CharField(max_length=64, blank=False)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    date = models.DateTimeField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "school": self.school.name,
            "date": self.date.strftime(f"%Y-%m-%d"),
            "subject": self.subject.subject
        }

class voteKicks(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    kicks = models.IntegerField(default=0)
    school = models.ForeignKey(School, blank=True, on_delete=models.CASCADE)

class appealKick(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    appealDate = models.DateTimeField()
    school = models.ForeignKey(School, blank=True, on_delete=models.CASCADE)

class Note(models.Model):
    title = models.CharField(max_length=64, blank=False)
    date = models.DateTimeField(auto_now_add=True)
    test = models.ForeignKey(Test, blank=True, null=True, on_delete=models.SET_NULL)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, blank=True, null=True,on_delete=models.CASCADE)
    school = models.ForeignKey(School, blank=True, on_delete=models.CASCADE)

    def serialize(self):
        test = None
        subject = None
        try:
            test = self.test.name
            subject = self.subject.subject
        except:
            pass
            
        return {
            "id": self.id,
            "title": self.title,
            "dateOfCreation": self.date.strftime(f"%Y-%m-%d"),
            "test":test,
            "subject": subject,
            "creator": self.creator.username,
            "school": self.school.name
        }

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    schools = models.ManyToManyField(School, blank=True, null=True)
    tests = models.ManyToManyField(Test, blank=True, null=True)
    def serialize(self):
        return {
            "user": self.user.username,
            "schools": [school.id for school in self.schools.all()],
            "tests": [test.name for test in self.tests.all()]
        }


