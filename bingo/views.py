from decimal import Decimal
from django.shortcuts import render, redirect
from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
import json
import random

from bingo.helper import check_bingo, process_bingo_transaction
from .models import BingoDailyRecord, BingoTransaction, BingoUser
from .card_lists import ahadu_bingo, hagere_bingo


game_pattern_list = [
    "full_house",
    "two_line",
    "one_line",
    "corners"
]
def get_bingo_numbers(request):
    numbers = random.sample(range(1, 76), 75)
    return JsonResponse({'numbers': numbers})


@login_required(login_url='/login')
def main(request):
    try:
        daily_record = BingoDailyRecord.objects.filter(
            user__owner=request.user, date=now().date(), transactions__started=True, transactions__ended=False
        ).latest('transactions__time')

        context = {
            "unfinished_transaction_id": daily_record.transactions.filter(ended=False).first().id,
            "cartellas": ahadu_bingo,
    'game_pattern_list': game_pattern_list,  # Game patterns
            "username": request.user.username,
    'game_pattern': 'two_line',  # The selected pattern (or default)
        }
    except BingoDailyRecord.DoesNotExist:
        context = {
            "cartellas": ahadu_bingo,
            "username": request.user.username,
    'game_pattern_list': game_pattern_list,  # Game patterns
    'game_pattern': 'two_line',  # The selected pattern (or default)
        }

    return render(request, 'bingo/base.html', context)


def logout_view(request):
    logout(request)
    return redirect('/login')


def login_view(request):
    error_message = None
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("bingo")
        else:
            error_message = "Invalid username or password."

    return render(request, "bingo/login.html", {"error_message": error_message})


@login_required
def fetch_reports(request):
    user = request.user
    start_date = request.GET.get("start_date")
    # end_date = request.GET.get("end_date")

    transactions = BingoTransaction.objects.filter(daily_record__user__owner=user)
    if not start_date:
        transactions = transactions.filter(daily_record__date=now().date())
    if start_date:
        transactions = transactions.filter(daily_record__date=start_date)
    # if end_date:
    #     transactions = transactions.filter(daily_record__date__lte=end_date)

    bingo = BingoUser.objects.get(owner=request.user)
    # Calculate totals
    total_transactions = transactions.count()
    total_balance = Decimal(bingo.balance)
    total_winning = sum(transaction.total_won for transaction in transactions)

    data = [
        {
            "date": transaction.daily_record.date.strftime("%Y-%m-%d"),
            "time": transaction.time.strftime("%H:%M:%S"),
            "bet": float(transaction.bet),
            "player_number": transaction.player_number,
            "total_won": float(transaction.total_won),
            "cut": float(transaction.cut),
            "won": float(transaction.won),
            "call_number": transaction.call_number,
            "winners": transaction.winners,
            "branch": transaction.daily_record.user.branch,
            "cashier": transaction.daily_record.user.owner.username,
            "balance": float(transaction.daily_record.user.balance),
        }
        for transaction in transactions
    ]
    # print(f'report data: {data}')

    return JsonResponse({
        "data": data,
        "total_transactions": total_transactions,
        "total_balance": total_balance,
        "total_winning": total_winning,
    })


@login_required
def check_winner(request):
    user = request.user
    transaction_id = request.POST.get('transaction_id')  # Extract transaction_id
    game_pattern = request.POST.get('game_pattern')
    try:
        # Ensure cartella is passed as a JSON array
        submitted_cartella = request.POST.get('cartella')
        print(f" submitted_cartella: {submitted_cartella}")

        # Retrieve the transaction object
        transaction = BingoTransaction.objects.get(id=transaction_id, daily_record__user__owner=user)

        if not transaction.result:
            print(f'trx result not found')
            raise ValueError("Game results not generated yet.")
        print(f'trx result: {transaction.result}')

        call_number = request.POST.get('call_number', 0)
        is_winner = check_bingo(transaction, int(submitted_cartella), int(call_number), game_pattern)
        print(f'trx is_winner {is_winner}')
        if is_winner:
            print('user has won the game')
            transaction.total_won = Decimal(transaction.bet) * Decimal(10)
            transaction.won = transaction.total_won
            transaction.winners += 1
            transaction.daily_record.total_winning = Decimal(transaction.daily_record.total_winning) + transaction.total_won
            transaction.daily_record.balance = Decimal(transaction.daily_record.balance) + transaction.total_won
            transaction.daily_record.save()
            transaction.save()

            return JsonResponse({
                "success": True,
                "is_winner": True,
                "total_won": transaction.total_won,
                "balance": transaction.daily_record.user.balance,
            })
        else:
            return JsonResponse({'success': True, 'is_winner': False, 'balance': transaction.daily_record.user.balance,})
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except BingoTransaction.DoesNotExist:
        return JsonResponse({"error": "Transaction not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Error checking winner: {str(e)}"}, status=500)


@login_required
def close_game(request):
    user = request.user
    try:
        daily_record = BingoDailyRecord.objects.get(user__owner=user, date=now().date())
        if not BingoTransaction.objects.filter(daily_record=daily_record, started=True).exists():
            raise ValueError("No active games to close.")

        return JsonResponse({
            "success": True,
            "balance": float(daily_record.user.balance),
            "total_winning": float(daily_record.user.total_winning),
            "total_cut": float(daily_record.user.total_cut),
        })
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except BingoDailyRecord.DoesNotExist:
        return JsonResponse({"error": "No active games for today."}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Error closing game: {str(e)}"}, status=500)


@csrf_exempt
@login_required(login_url='/login')
def start_bingo(request):
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
                "transaction_id": transaction.id,
                "cut": float(transaction.cut),
            })
        except ValueError as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)
