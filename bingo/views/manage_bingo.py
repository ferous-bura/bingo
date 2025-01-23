from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from bingo.helper import refund_bingo_transaction
from django.http import JsonResponse
import json
from django.utils.timezone import now

from bingo.models import BingoDailyRecord, BingoTransaction


@csrf_exempt
@login_required(login_url='/login')
def refund_bingo(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print('start bingo, data: ', data)
            transaction_id = int(data.get('transaction_id', 0))
            transaction, result, new_balance = refund_bingo_transaction(
                request.user, transaction_id
            )

            return JsonResponse({
                "status": "success",
                "message": "Game Refunded successfully.",
                "new_balance": float(new_balance),
                "result": result,
                # "refund": True,
                "transaction_id": transaction.transaction_id,
                "cut": float(transaction.cut),
            })
        except ValueError as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)


@login_required
def close_game(request):
    user = request.user
    try:
        daily_record = BingoDailyRecord.objects.get(user__owner=user, date=now().date())
        transactions = BingoTransaction.objects.filter(daily_record=daily_record, started=True, ended=False)
        if not transactions.exists():
            raise ValueError("No active games to close.")
        for transaction in transactions:
            transaction.ended = True
            transaction.save()

        return JsonResponse({
            "status": "success",
            # "balance": float(daily_record.user.balance),
            # "total_winning": float(daily_record.total_winning),
            # "total_cut": float(daily_record.total_cut),
        })
    except ValueError as e:
        print({"error 400": str(e)})
        return JsonResponse({"status": "error", "error": str(e)}, status=400)
    except BingoDailyRecord.DoesNotExist:
        print({"error 404": str(e)})
        return JsonResponse({"status": "error", "error": "No active games for today."}, status=404)
    except Exception as e:
        print({"error 500": str(e)})
        return JsonResponse({"status": "error", "error": f"Error closing game: {str(e)}"}, status=500)
