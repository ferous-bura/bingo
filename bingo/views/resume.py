from decimal import Decimal
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import random

from bingo.helper import process_bingo_transaction



def get_bingo_numbers(request):
    numbers = random.sample(range(1, 76), 75)
    return JsonResponse({'numbers': numbers})

@csrf_exempt
@login_required(login_url='/login')
def resume_bingo(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print('start bingo, data: ', data)
            cartella_list = data.get('cartellas', [])
            bet_amount = Decimal(data.get('bet_amount', 0))
            print(f'data, {request.body}, {cartella_list}, {bet_amount}')
            transaction, result, new_balance = process_bingo_transaction(
                request.user, cartella_list, bet_amount, 25
            )

            return JsonResponse({
                "status": "success",
                "message": "Game started successfully.",
                "new_balance": float(new_balance),
                "result": result,
                "transaction_id": transaction.transaction_id,
                "cut": float(transaction.cut),
            })
        except ValueError as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)
