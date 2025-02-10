import os
import uuid
from django.shortcuts import get_object_or_404
import requests
import winreg  # Windows registry
from functools import wraps
from django.contrib.auth.models import User

from offline_app.helper import REGISTRY_PATH, SERVER_URL, headers

def get_machine_id():
    """Get the unique machine ID."""
    return str(uuid.getnode())

def get_username():
    """Get the current system username."""
    return os.getlogin()

def save_license_to_registry(license_key):
    """Save license key in Windows registry."""
    try:
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, REGISTRY_PATH) as key:
            winreg.SetValueEx(key, "LicenseKey", 0, winreg.REG_SZ, license_key)
    except Exception as e:
        print(f"Error saving license: {e}")

def load_license_from_registry():
    """Load license key from Windows registry."""
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REGISTRY_PATH, 0, winreg.KEY_READ) as key:
            license_key, _ = winreg.QueryValueEx(key, "LicenseKey")
            return license_key
    except FileNotFoundError:
        return None

def request_license():
    """Request a new license from the server."""
    machine_id = get_machine_id()
    # username = get_username()
    user = get_object_or_404(User, id=17)
    username = user.username

    url = f"{SERVER_URL}offline/license-request/"
    try:
        print(f'url {url}')
        print(f'headers {headers}')
        print(f'username {username}')
        response = requests.post(url, headers=headers, json={"username": username, "machine_id": machine_id}, timeout=60)  # Send POST request
        print(f'response {response}')
        response.raise_for_status()  # Raises HTTPError for bad responses (4xx and 5xx)

        if response.status_code == 200:
            data = response.json()
            license_key = data.get("license_key")
            save_license_to_registry(license_key)
            print("✅ License received and saved!")
            return True
        else:
            print(response.json())
            print(f"❌ License request failed: {response.json().get('error')}")
            return False

    except requests.exceptions.ConnectionError:
        return False

    except requests.exceptions.Timeout:
        return False

    except requests.exceptions.HTTPError as err:
        print(f'err {err}')
        return False

    except Exception as e:
        print(f'err {e}')
        return False

def validate_license_with_server():
    """Validate the license with the server."""
    license_key = load_license_from_registry()
    if not license_key:
        print("❌ No license found. Requesting one...")
        return request_license()

    machine_id = get_machine_id()
    response = requests.get(f"{SERVER_URL}offline/validate/{license_key}/{machine_id}/")

    if response.status_code == 200:
        print("✅ License Valid!")
        return True
    else:
        print(f"❌ License Invalid: {response.json().get('error')}")
        return False

def license_required(func):
    """Decorator to check if a valid license exists before executing a function."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if validate_license_with_server():
            return func(*args, **kwargs)
        else:
            raise PermissionError("License validation failed! Please obtain a valid license.")
    return wrapper

@license_required
def start_bingo():
    print("🎉 Starting Bingo Game!")

# if __name__ == "__main__":
#     if validate_license_with_server():
#         start_bingo()
