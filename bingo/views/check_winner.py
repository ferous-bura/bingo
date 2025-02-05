from decimal import Decimal
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from bingo.helper import get_today_date
from bingo.pattern_check import check_bingo
from bingo.models import BingoTransaction

@csrf_exempt
@login_required
def lock(request):
    if request.method == 'POST':

        try:
            data = json.loads(request.body)

            user = request.user
            transaction_id = data.get('transaction_id', False)
            submitted_cartella = data.get('cartella_num', None)
            print(f" submitted_cartella: {submitted_cartella}, transaction_id: {transaction_id}")
            transaction = BingoTransaction.objects.filter(transaction_id=transaction_id, daily_record__user__owner=user).latest('time')

            if not transaction.result:
                print(f'trx result not found')
                raise ValueError("Game results not generated yet.")

            locked_cartella = transaction.locked_cartella.split(",") if transaction.locked_cartella else []

            if submitted_cartella and str(submitted_cartella) not in locked_cartella:
                locked_cartella.append(str(submitted_cartella))                
                transaction.locked_cartella = ",".join(locked_cartella)
                transaction.save()
                data = {"status": "success",'success': True, 'locked': True, 'cartella': submitted_cartella}
                print(f'locked data {data}')
                return JsonResponse(data)
            else:
                if str(submitted_cartella) in locked_cartella:
                    locked_cartella.remove(str(submitted_cartella))
                    transaction.locked_cartella = ",".join(locked_cartella)
                    transaction.save()

                data = {"status": "success",'success': True, 'locked': False, 'cartella': submitted_cartella}
                print(f'un-locked data {data}')
                return JsonResponse(data)
        except ValueError as e:
            print(f'error 400 {e}')
            return JsonResponse({"error": str(e)}, status=400)
        except BingoTransaction.DoesNotExist:
            print(f'error trx doesnt exist')
            return JsonResponse({"error": "Transaction not found."}, status=404)
        except Exception as e:
            print(f'error 500 {e}')
            return JsonResponse({"error": f"Error Locking Cartella: {str(e)}"}, status=500)
    return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)


@login_required
def check_winner(request):
    user = request.user
    transaction_id = request.POST.get('transaction_id')  # Extract transaction_id
    game_pattern = request.POST.get('game_pattern')
    refund = False
    try:
        # Ensure cartella is passed as a JSON array
        #
        submitted_cartella = request.POST.get('cartella')
        print(f" submitted_cartella: {submitted_cartella}, transaction_id: {transaction_id}")
        if submitted_cartella is None or submitted_cartella == '':
            print(f'cartella not found')
            raise ValueError("Cartella not found")

        from datetime import timedelta
        start_of_day, end_of_day = get_today_date()

        transaction = BingoTransaction.objects.filter(transaction_id=transaction_id, daily_record__user__owner=user, created_at__range=(start_of_day, end_of_day)).latest('time')

        if not transaction.result:
            print(f'trx result not found')
            raise ValueError("Game results not generated yet.")
        print(f'trx result: {transaction.result}')

        locked_cartella = transaction.locked_cartella.split(",") if transaction.locked_cartella else []
        if submitted_cartella and str(submitted_cartella) in locked_cartella:
            print(f'locked cartella found')
            return JsonResponse({'success': False, 'error': 'Cartella is locked'})

        print(f'trx result: {transaction.result}')

        call_number = request.POST.get('call_number', 0)
        is_winner = check_bingo(transaction, int(submitted_cartella), int(call_number), game_pattern)
        print(f'trx is_winner {is_winner}, call_number {call_number}')
        transaction = BingoTransaction.objects.filter(transaction_id=transaction_id, daily_record__user__owner=user).latest('time')

        winners_list = transaction.winners.split(",") if transaction.winners else []

        if len(winners_list) > 3:
            if transaction.call_number == int(call_number):
                refund = True

        if is_winner:

            total_won = transaction.total_won
            cut = transaction.cut
            won = transaction.won
            balance = transaction.daily_record.user.balance

            print(f'user has won the game, winners_list {winners_list}')
            if str(submitted_cartella) not in winners_list:
                print(f"{submitted_cartella} is not in the winners list.")
                winners_list.append(str(submitted_cartella))
                if len(winners_list) > 3:
                    refund = True
                transaction.winners = ",".join(winners_list)
                if transaction.call_number == 0:
                    transaction.call_number = int(call_number)
                transaction.save()
                print(f'transaction saved call_number: {transaction.call_number}, winners: {transaction.winners}, {transaction}')
            else:
                print(f"{submitted_cartella} is already in the winners list.")

            data = {
                "success": True,
                "is_winner": True,
                "total_won": won / Decimal(len(winners_list)),
                "balance": balance,
                "refund": refund,
                "game_pattern": f'ዝግ፡ {transaction.get_game_pattern_display()}', 
                'locked': transaction.locked_cartella,
            }
            print(f'check response: {data}') 
            print(f'won {won}, total_won {total_won}, cut {cut}')
            print(f'winners_list {winners_list}')
            print(f'len winners list {len(winners_list)}')
            print(f'refund: {refund}') 
            print(f'transaction.locked_cartella: {transaction.locked_cartella}') 

            return JsonResponse(data)
        else:
            data = {
                'success': True, 'is_winner': False, 
                "game_pattern": f'ዝግ፡ {transaction.get_game_pattern_display()}', 
                'balance': transaction.daily_record.user.balance, 
                'refund': refund, 
                'locked': transaction.locked_cartella
            }
            return JsonResponse(data)
    except ValueError as e:
        print(f'error 400 {e}')
        return JsonResponse({"error": str(e)}, status=400)
    except BingoTransaction.DoesNotExist:
        print(f'error trx doesnt exist')
        return JsonResponse({"error": "Transaction not found."}, status=404)
    except Exception as e:
        print(f'error 500 {e}')
        return JsonResponse({"error": f"Error checking winner: {str(e)}"}, status=500)
