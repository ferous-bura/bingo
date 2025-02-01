from decimal import Decimal
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from bingo.helper import process_bingo_transaction


@csrf_exempt
@login_required(login_url='/login')
def start_bingo(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            cartella_list = data.get('cartellas', [])
            transaction_id = data.get('transaction_id', False)
            print(f'start transaction_id data: {transaction_id}')

            game_pattern = data.get('game_pattern', 'default')
            bet_type = int(data.get('bet_type', 0))
            bet_amount = Decimal(data.get('bet_amount', 0))
            transaction, result, new_balance = process_bingo_transaction(
                request.user, cartella_list, bet_amount, 25, game_pattern, transaction_id, bet_type
            )
            data = {
                "status": "success",
                "message": "Game started successfully.",
                "new_balance": float(new_balance),
                "result": result,
                "transaction_id": transaction.transaction_id,
                "cut": float(transaction.cut),
            }
            print(f'start bingo data: {data}')
            return JsonResponse(data)
        except ValueError as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)

