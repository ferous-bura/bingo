from decimal import Decimal
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

from bingo.pattern_check import check_bingo
from bingo.models import BingoTransaction

@login_required
def check_winner(request):
    user = request.user
    transaction_id = request.POST.get('transaction_id')  # Extract transaction_id
    game_pattern = request.POST.get('game_pattern')
    refund = False
    try:
        # Ensure cartella is passed as a JSON array
        submitted_cartella = request.POST.get('cartella')
        print(f" submitted_cartella: {submitted_cartella}, transaction_id: {transaction_id}")

        # Retrieve the transaction object
        transaction = BingoTransaction.objects.get(transaction_id=transaction_id, daily_record__user__owner=user)

        if not transaction.result:
            print(f'trx result not found')
            raise ValueError("Game results not generated yet.")
        print(f'trx result: {transaction.result}')

        call_number = request.POST.get('call_number', 0)
        is_winner = check_bingo(transaction, int(submitted_cartella), int(call_number), game_pattern)
        print(f'trx is_winner {is_winner}, call_number {call_number}')
        transaction = BingoTransaction.objects.get(transaction_id=transaction_id, daily_record__user__owner=user)

        winners_list = transaction.winners.split(",") if transaction.winners else []

        if len(winners_list) > 3:
            refund = True

        if is_winner:

            total_won = transaction.total_won
            cut = transaction.cut
            won = transaction.won
            balance = transaction.daily_record.user.balance

            print('user has won the game')
            if str(submitted_cartella) not in winners_list:
                print(f"{submitted_cartella} is not in the winners list.")
                winners_list.append(str(submitted_cartella))                
                if len(winners_list) > 3:
                    refund = True
                transaction.winners = ",".join(winners_list)
                transaction.call_number = call_number
                transaction.save()
            else:
                print(f"{submitted_cartella} is already in the winners list.")

            data = {
                "success": True,
                "is_winner": True,
                "total_won": won / Decimal(len(winners_list)),
                "balance": balance,
                "refund": refund,
            }
            print(f'check response: {data}') 
            print(f'won {won}, total_won {total_won}, cut {cut}')
            print(f'winners_list {winners_list}')
            print(f'len winners list {len(winners_list)}')
            print(f'refund: {refund}') 

            return JsonResponse(data)
        else:
            data = {'success': True, 'is_winner': False, 'balance': transaction.daily_record.user.balance, 'refund': refund,}
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
