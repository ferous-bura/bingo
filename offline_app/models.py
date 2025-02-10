from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User


class OfflineUsers(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name="offline")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_updated = models.DateTimeField(default=now)  # Track last update date
    device_id = models.CharField(max_length=255, blank=True, null=True)  # Store unique device ID

    def __str__(self):
        return self.owner.username

class UserLocation(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

class UserDevice(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    device_id = models.CharField(max_length=255, unique=True)  # Unique device binding
