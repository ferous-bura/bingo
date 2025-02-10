import json
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from geopy.distance import geodesic

from offline_app.helper import get_device_id, get_ip_location  # To compare distances
from .models import UserLocation, UserDevice


@csrf_exempt
@login_required(login_url='/login')
def check_location(request):
    """Check user location and device, ensuring they match previous records."""
    
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

    if not latitude or not longitude or not device_id:
        return JsonResponse({"success": False, "message": "Missing location or device information."}, status=400)

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
            return JsonResponse({
                "success": False, 
                "message": "Location mismatch. Browser and IP location differ significantly.",
                "browser_location": browser_location,
                "ip_location": ip_location
            }, status=403)

    # Check if the request comes from the correct device
    if user_device.device_id and user_device.device_id != device_id:
        return JsonResponse({"success": False, "message": "Unauthorized device detected."}, status=403)

    # Update and save user location & device details
    user_location.latitude = latitude
    user_location.longitude = longitude
    user_location.save()

    user_device.device_id = device_id
    user_device.save()

    return JsonResponse({"success": True, "message": "Location and device verified."}, status=200)

@csrf_exempt
@login_required(login_url='/login')
def save_location(request):
    """Save user location after verifying browser & IP-based location match."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            latitude = data.get("latitude")
            longitude = data.get("longitude")
            device_id = get_device_id()
            ip_address = request.META.get("REMOTE_ADDR")  # Get user's IP address

            if latitude is None or longitude is None or device_id is None:
                return JsonResponse({"success": False, "message": "Invalid data"}, status=400)

            user = request.user

            # Get location from IP
            ip_lat, ip_lon = get_ip_location(ip_address)

            if ip_lat is not None and ip_lon is not None:
                # Compare browser and IP locations (within 10 km)
                browser_location = (latitude, longitude)
                ip_location = (ip_lat, ip_lon)
                distance = geodesic(browser_location, ip_location).km

                if distance > 10:
                    return JsonResponse({
                        "success": False, 
                        "message": f"Location mismatch. Browser: {browser_location}, IP: {ip_location}"
                    }, status=403)

            try:
                # Save location
                user_location, created = UserLocation.objects.get_or_create(user=user)
                user_location.latitude = latitude
                user_location.longitude = longitude
                user_location.save()
            except Exception as e:
                print(f'err {e}')
                return JsonResponse({"success": False, "message": "Your Location is not correct"}, status=403)

            try:
                # Save device ID
                user_device, created = UserDevice.objects.get_or_create(user=user)
                user_device.device_id = device_id
                user_device.save()
            except Exception as e:
                print(f'err {e}')
                return JsonResponse({"success": False, "message": "Please use Original Copy of this app"}, status=403)

            return JsonResponse({"success": True})

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON format"}, status=400)

    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)
