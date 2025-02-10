from django.contrib import admin

from offline_app.models import OfflineUsers, UserDevice, UserLocation

# Register your models here.

admin.site.register(UserLocation)
admin.site.register(UserDevice)
admin.site.register(OfflineUsers)

