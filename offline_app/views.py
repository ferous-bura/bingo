import requests
from decimal import Decimal
from django.shortcuts import redirect, render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bingo.models import BingoUser, User

from django.contrib.auth.decorators import login_required

from offline_app.helper import SERVER_URL, get_device_id, has_valid_device, has_valid_location,  is_user_offline, headers
from bingo.helper import is_user_bingo
from offline_app.license import license_required
from offline_app.models import UserLocation

@login_required(login_url='/login')
def index(request):
    """Render the index page if the user has both a location and a valid device."""

    username = request.user.username
    user = get_object_or_404(User, username=username, id=17)

    is_offline_user = is_user_offline(user)
    if not is_offline_user:
        return redirect('bingo')  # if not offline user redirect to homepage

    if not has_valid_location(user) or not has_valid_device(user):
        return render(request, "offline_app/location.html")  # Show location prompt

    is_bingo_user = is_user_bingo(user)
    if not is_bingo_user:
        return HttpResponse('please register first')  # if not offline user redirect to homepage

    return render(request, "offline_app/index.html", {'current_balance': user.user.balance})


@login_required(login_url='/login')
@license_required
@csrf_exempt  # Disable CSRF protection for this view
def request_update_balance(request):

    username = request.user.username
    user = get_object_or_404(User, username=username, id=17)

    is_offline_user = is_user_offline(user)
    if not is_offline_user:
        return redirect('bingo')  # if not offline user redirect to homepage

    if request.method != 'POST':
        return JsonResponse({'status': False, 'message': 'Invalid request method.'})

    old_balance = user.user.balance
    device_id = get_device_id()  # Get the unique device ID
    test_mode = False
    if test_mode:
        url = f"http://127.0.0.1:8001/offline/verify-update-balance/"  # Ensure correct port
    else:
        url = f"{SERVER_URL}offline/verify-update-balance/"  # Ensure correct port
    balance = old_balance
    print(f'request_update_balance {username}, {old_balance} {device_id} POST {url}')
    # Get the latest user location
    try:
        user_location = UserLocation.objects.get(user=user)
        latitude = user_location.latitude
        longitude = user_location.longitude
    except UserLocation.DoesNotExist:
        latitude, longitude = None, None  # Default values if location is unavailable

    payload = {
        'username': username,
        'old_balance': str(old_balance),
        'device_id': device_id,
        'latitude': latitude,
        'longitude': longitude,
    }
    added_balance = False

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)  # Send POST request
        response.raise_for_status()  # Raises HTTPError for bad responses (4xx and 5xx)

        data = response.json()
        if data.get("success", False):
            new_balance = Decimal(data.get("new_balance", 0))
            new_balance += balance
            BingoUser.objects.filter(owner=user).update(balance=new_balance)
            message = "Balance updated successfully."
            status = True
            balance = new_balance
        else:
            status = False
            message = data.get("message", 'failed')
            added_balance = Decimal(data.get("new_balance", 0))

    except requests.exceptions.ConnectionError:
        message = "Failed to connect to the server."
        status = False
    except requests.exceptions.Timeout:
        message = "Request timed out."
        status = False
    except requests.exceptions.HTTPError as err:
        print(f'err {err}')
        message = f"HTTP Error: : please contact master"
        status = False
    except Exception as e:
        print(f'err {e}')
        message = f"Unexpected error: please contact master"
        status = False

    return JsonResponse({
        'status': status,
        'message': message,
        'balance': str(balance),
        'added_balance': 0 if not added_balance else str(added_balance),

    })
