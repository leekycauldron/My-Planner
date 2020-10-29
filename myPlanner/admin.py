from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(User),
admin.site.register(Subject),
admin.site.register(School),
admin.site.register(Test),
admin.site.register(Note),
admin.site.register(Profile),
admin.site.register(voteKicks),
admin.site.register(appealKick)