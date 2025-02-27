"""
curl -X POST http://127.0.0.1:8000/api/login/ -H "Content-Type: application/json" -d "{\"username\": \"shi80\", \"password\": \"bingo2025\"}"
curl -X GET https://www.hagere-games.com/login -H "Content-Type: application/json" -d "{\"username\": \"shi80\", \"password\": \"bingo2025\"}"

"""
import json
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from rest_framework.authtoken.models import Token

from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def api_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print(f"Parsed data: {data}")
        username = data.get("username", '')
        password = data.get("password", '')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Check if the user has a token, if not create one
            token, created = Token.objects.get_or_create(user=user)
            
            # Log the user in
            login(request, user)

            # If the user is staff, send a different redirect URL
            if user.is_staff:
                return JsonResponse({
                    "message": "Success", 
                    "redirect_url": "/admin/", 
                    "token": token.key
                })

            return JsonResponse({
                "message": "Success", 
                "redirect_url": "/bingo",
                "token": token.key  # Include the token here
            })
        else:
            return JsonResponse({"message": "Invalid username or password."})

    return JsonResponse({"message": "Invalid request method."})


