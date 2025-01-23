from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils.timezone import now
from decimal import Decimal

from bingo.models import BingoTransaction, BingoUser

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
    total_cut = sum(transaction.cut for transaction in transactions)

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
            "winners":transaction.winners if transaction.winners else transaction.submitted_cartella,
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
        "total_cut": total_cut,
    })
