from django.core.exceptions import ObjectDoesNotExist
import platform
import uuid

import requests

from .models import UserLocation, UserDevice, OfflineUsers

SERVER_URL = "https://offlineapp.pythonanywhere.com/"
# SERVER_URL = "http://http://127.0.0.1:9999/"
REGISTRY_PATH = r"SOFTWARE\OrmBpoigongo"
BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
headers = {"User-Agent": BROWSER_USER_AGENT}


def is_user_offline(user):
    try:
        return OfflineUsers.objects.get(owner=user) is not None
    except ObjectDoesNotExist:
        return False

def get_ip_location(ip_address):
    """Get location using IP address"""
    print(f'ip address {ip_address}')
    try:
        response = requests.get(f"https://ipinfo.io/{ip_address}/json")
        data = response.json()
        if "loc" in data:
            latitude, longitude = map(float, data["loc"].split(","))
            return latitude, longitude
    except Exception as e:
        print(f"IP location error: {e}")
    return None, None  # Default if location cannot be found


def has_valid_location(user):
    """Check if the user has a registered location."""
    try:
        return UserLocation.objects.get(user=user) is not None
    except ObjectDoesNotExist:
        return False

def has_valid_device(user):
    """Check if the user has a registered device."""
    try:
        return UserDevice.objects.get(user=user) is not None
    except ObjectDoesNotExist:
        return False

def get_device_id():
    """Generate a unique device ID based on system specifications."""
    system_info = f"{platform.system()}_{platform.release()}_{uuid.getnode()}"
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, system_info))
