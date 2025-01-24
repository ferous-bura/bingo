from decimal import Decimal
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.utils.timezone import now

from bingo.models import BingoDailyRecord, BingoUser
from bingo.pattern_choice import GAME_PATTERN_CHOICES
from bingo.card_lists import ahadu_bingo, hagere_bingo

@login_required(login_url='/login')
def main(request):
    try:
        context = get_main_context(request)
    except Exception as e:
        print(f'main exception {e}')
    print(f'running smoothly')

    return render(request, 'bingo/base.html', context)

def get_main_context(request):
    """Assemble the main context for the template."""
    game_pattern_list = get_game_pattern_list()
    bingo_user = get_bingo_user(request.user)    
    print(f'game_pattern_list: {game_pattern_list}')

    try:
        last_trx, balance, branch, username, cut_percentage = get_user_data(bingo_user, request)
        context = create_context_with_transaction(
            last_trx, balance, branch, username, cut_percentage, game_pattern_list
        )
    except BingoDailyRecord.DoesNotExist:
        balance, branch, username, cut_percentage = get_bingo_user_data(bingo_user)
        context = create_context_without_transaction(
            balance, branch, username, cut_percentage, game_pattern_list
        )
    return context

def get_game_pattern_list():
    """Retrieve game patterns as a dictionary."""
    return dict(GAME_PATTERN_CHOICES)

def get_bingo_user(user):
    """Fetch the BingoUser object for the logged-in user."""
    return BingoUser.objects.get(owner=user)

def get_user_data(bingo_user, request):
    """Fetch user-related data and the latest transaction."""
    balance = Decimal(bingo_user.balance)
    branch = bingo_user.branch
    cut_percentage = bingo_user.cut_percentage
    username = bingo_user.owner.username

    daily_record = BingoDailyRecord.objects.filter(
        user__owner=request.user, date=now().date(), transactions__started=True, transactions__ended=False
    ).latest('transactions__time')
    last_trx = daily_record.transactions.filter(ended=False).first()
    return last_trx, balance, branch, username, cut_percentage

def create_context_with_transaction(last_trx, balance, branch, username, cut_percentage, game_pattern_list):
    """Create context when there is an unfinished transaction."""
    print(f'context with trx {last_trx}')
    return {
        "cartellas": ahadu_bingo if branch == 'ahadu_bingo' else hagere_bingo,
        'game_pattern_list': game_pattern_list,
        "username": username,
        "unfinished_transaction_id": last_trx.transaction_id if last_trx else None,
        'game_pattern': 'default',
        "balance": balance,
        "cut_percentage": cut_percentage,
        # Uncomment and adapt these fields as needed:
        # "result": last_trx.result if last_trx else None,
        # "player_number": last_trx.player_number if last_trx else None,
        # "total_won": last_trx.total_won if last_trx else None,
        # "won": last_trx.won if last_trx else None,
        # "bet_amount": last_trx.bet if last_trx else None,
        # "winners": len(last_trx.winners) if last_trx else 0,
        # "cut": Decimal(last_trx.cut) if last_trx else None,
        # "submitted_cartella": last_trx.submitted_cartella.split(",") if last_trx and last_trx.submitted_cartella else [],
    }

def create_context_without_transaction(balance, branch, username, cut_percentage, game_pattern_list):
    print(f'context without trx')
    """Create context when there is no unfinished transaction."""
    return {
        "cartellas": ahadu_bingo if branch == 'ahadu_bingo' else hagere_bingo,
        "username": username,
        'game_pattern_list': game_pattern_list,
        'game_pattern': 'default',
        'transaction_id': 1,  # Default ID if no transaction exists
        "balance": balance,
        "cut_percentage": cut_percentage,
    }

def get_bingo_user_data(bingo_user):
    """Extract balance, branch, username, and cut percentage from BingoUser."""
    return Decimal(bingo_user.balance), bingo_user.branch, bingo_user.owner.username, bingo_user.cut_percentage
