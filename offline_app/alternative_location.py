import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from geopy.distance import geodesic

from offline_app.helper import get_device_id, get_ip_location
from .models import UserLocation, UserDevice


def validate_location_and_device(user, latitude, longitude, device_id, ip_address):
    """
    Helper function to validate user location and device information.
    """
    if not latitude or not longitude or not device_id:
        return {"success": False, "message": "Missing location or device information.", "status": 400}

    # Get or create user location and device entries
    user_location, _ = UserLocation.objects.get_or_create(user=user)
    user_device, _ = UserDevice.objects.get_or_create(user=user)

    # Get location from IP
    ip_lat, ip_lon = get_ip_location(ip_address)

    if ip_lat and ip_lon:
        # Compare browser and IP locations (within 10 km)
        browser_location = (latitude, longitude)
        ip_location = (ip_lat, ip_lon)
        distance = geodesic(browser_location, ip_location).km

        if distance > 10:
            return {
                "success": False, 
                "message": "Location mismatch. Browser and IP location differ significantly.",
                "browser_location": browser_location,
                "ip_location": ip_location,
                "status": 403
            }

    # Check if the request comes from the correct device
    if user_device.device_id and user_device.device_id != device_id:
        return {"success": False, "message": "Unauthorized device detected.", "status": 403}

    return {"success": True, "user_location": user_location, "user_device": user_device}


@csrf_exempt
@login_required(login_url='/login')
def check_location(request):
    """Check user location and device without saving."""
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "Invalid request method."}, status=400)

    user = request.user

    try:
        data = json.loads(request.body)
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        device_id = get_device_id()
        ip_address = request.META.get("REMOTE_ADDR")  # Get user's IP
    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({"success": False, "message": "Invalid data format."}, status=400)

    validation_result = validate_location_and_device(user, latitude, longitude, device_id, ip_address)

    if not validation_result["success"]:
        return JsonResponse(validation_result, status=validation_result["status"])

    return JsonResponse({"success": True, "message": "Location and device verified."}, status=200)


@csrf_exempt
@login_required(login_url='/login')
def save_location(request):
    """Check user location and device, then save them."""
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "Invalid request method."}, status=405)

    user = request.user

    try:
        data = json.loads(request.body)
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        device_id = get_device_id()
        ip_address = request.META.get("REMOTE_ADDR")  # Get user's IP
    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=400)

    validation_result = validate_location_and_device(user, latitude, longitude, device_id, ip_address)

    if not validation_result["success"]:
        return JsonResponse(validation_result, status=validation_result["status"])

    try:
        # Save location
        user_location = validation_result["user_location"]
        user_location.latitude = latitude
        user_location.longitude = longitude
        user_location.save()
    except Exception as e:
        print(f'Error saving location: {e}')
        return JsonResponse({"success": False, "message": "Error saving location."}, status=500)

    try:
        # Save device ID
        user_device = validation_result["user_device"]
        user_device.device_id = device_id
        user_device.save()
    except Exception as e:
        print(f'Error saving device ID: {e}')
        return JsonResponse({"success": False, "message": "Error saving device ID."}, status=500)

    return JsonResponse({"success": True, "message": "Location and device saved successfully."}, status=200)
