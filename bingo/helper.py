import random
from decimal import Decimal
import logging
from decimal import Decimal
from django.core.exceptions import ObjectDoesNotExist
from django.utils.timezone import now, localtime, make_aware
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404

from bingo.models import BingoTransaction, BingoDailyRecord, BingoUser, BingoCard
logger = logging.getLogger(__name__)


def get_today_date():
    today = localtime(now()).date()
    start_of_day = make_aware(datetime(today.year, today.month, today.day))
    end_of_day = start_of_day + timedelta(days=1)
    return start_of_day, end_of_day


def get_cartellas(branch):
    """Return cartellas based on the branch."""
    card = get_object_or_404(BingoCard, name=branch)
    return card.cards  # Return the list of cartellas stored in the JSONField


def retrieve_cartella(transaction, submitted_cartella):
    """Retrieve the relevant cartella based on the user's branch."""
    branch = transaction.daily_record.user.branch

    try:
        # Fetch the cartellas for the user's branch
        cartellas = get_cartellas(branch)
        
        # Retrieve the specific cartella
        cartella = cartellas[int(submitted_cartella) - 1]
        print(f"Retrieved cartella for '{branch}': {cartella}")
        return cartella
    except IndexError as e:
        print(f"Error retrieving cartella for '{branch}': {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

# Helper Functions
def generate_result():
    """Generate and shuffle bingo numbers."""
    bingo_numbers = list(range(1, 76))
    random.shuffle(bingo_numbers)
    print('shuffled numbers,', bingo_numbers)
    return bingo_numbers

def validate_cartellas(cartella_list, valid_range):
    """Validate the selected cartellas against a valid range."""
    return all(c in valid_range for c in cartella_list)
# Set up logger

def process_bingo_transaction(user, cartella_list, bet_amount, game_type, game_pattern, transaction_id, bet_type):
    """Process a bingo transaction including balance updates and validation."""
    try:
        # Retrieve BingoUser instance for the current user
        try:
            bingo_user = BingoUser.objects.get(owner=user)
        except BingoUser.DoesNotExist:
            raise ValueError("BingoUser for the current user does not exist.")

        bet_amount = Decimal(bet_amount)  # Ensure bet_amount is a Decimal
        cut_perc = 25
        if bet_type == 0:
            cut_perc = 25
        elif bet_type == 1:
            cut_perc = 25
        elif bet_type == 2:
            cut_perc = 30
        elif bet_type == 3:
            cut_perc = 35
        elif bet_type == 4:
            cut_perc = 40
        elif bet_type == 5:
            cut_perc = 20
        elif bet_type == 6:
            cut_perc = 15
        elif bet_type == 7:
            cut_perc = 10
        else:
            pass

        win = bet_amount * Decimal(len(cartella_list))
        agent_cut = (win * Decimal(cut_perc)) / Decimal(100)
        player_win = win - agent_cut

        # Debug log for data processing
        print(f'Processing bingo transaction bet_type {bet_type}. balance: {Decimal(bingo_user.balance)}, user={user}, bet_amount={bet_amount}, win={win}, '
                     f'agent_cut={agent_cut}, player_win={player_win}, cartella_list={cartella_list}')

        # Check if the user has enough balance
        if Decimal(bingo_user.balance) < agent_cut:
            raise ValueError("Insufficient balance.")

        valid_cartellas = range(0, 150)  # Assuming cartella numbers should be within 0-149
        # if not validate_cartellas(cartella_list, valid_cartellas):
        #     raise ValueError("Invalid cartella selection.")

        # Update user balance
        bingo_user.balance = Decimal(bingo_user.balance) - agent_cut
        bingo_user.cut_percentage = cut_perc
        bingo_user.save()

        # Update or create the daily record
        start_of_day, end_of_day = get_today_date()
        # Now use the BingoUser instance for get_or_create
        daily_record, created = BingoDailyRecord.objects.get_or_create(user=bingo_user, date__range=(start_of_day, end_of_day))

        daily_record.total_winning = Decimal(daily_record.total_winning) + player_win
        daily_record.total_transactions += 1
        daily_record.total_cut = Decimal(daily_record.total_cut) + agent_cut
        daily_record.save()

        # Generate result and create transaction
        result = generate_result()
        submitted_cartella = []
        submitted_cartella.append(str(cartella_list))

        # transaction_id = daily_record.total_transactions
        # transaction, created = BingoTransaction.objects.get_or_create(
        #     started=True,
        #     game_pattern=game_pattern,
        #     daily_record=daily_record,
        #     game_type=game_type,
        #     result=result,
        #     bet=bet_amount,
        #     player_number=len(cartella_list),
        #     submitted_cartella=",".join(submitted_cartella),
        #     total_won=win,
        #     cut=agent_cut,
        #     won=player_win,
        #     call_number=0,
        #     transaction_id=transaction_id
        # )

        # Prepare default values for the transaction
        single_balance = bingo_user.balance
        defaults = {
            'started': True,
            'game_pattern': game_pattern,
            'daily_record': daily_record,
            'game_type': game_type,
            'result': result,
            'bet': bet_amount,
            'player_number': len(cartella_list),
            'submitted_cartella': ",".join(submitted_cartella),
            'total_won': win,
            'cut': agent_cut,
            'won': player_win,
            'call_number': 0,
            'single_balance': single_balance,
        }
        try:
            # trx = BingoTransaction.objects.filter(daily_record=daily_record, started=True, refunded=True).latest('-time')
            # Check if any matching transactions exist
            trx = BingoTransaction.objects.filter(daily_record=daily_record, started=True, refunded=True, ended=False)
            print(f'trx {daily_record}, trx {trx}')

            if trx.exists():
                # Get the latest refunded transaction
                transaction = trx.latest('-time')
                # if transaction_id:
                # BingoTransaction.objects.filter(transaction_id=transaction_id).update(**defaults)
                for key, value in defaults.items():
                    setattr(transaction, key, value)
                transaction.save()
                # transaction = BingoTransaction.objects.get(transaction_id=transaction_id)
                print("trx refunded.")
                print(f'Transaction updated successfully: {transaction}')
            else:
                raise ValueError('trx not found')

        except Exception as e:
            transaction_id = daily_record.total_transactions
            transaction = BingoTransaction.objects.create(
                transaction_id=transaction_id,
                **defaults
            )
            print(f'Transaction created successfully: {transaction}, {e}')

        return transaction, result, bingo_user.balance

    except ObjectDoesNotExist as e:
        logger.error(f"Object does not exist: {e}")
        raise ValueError(f"Error processing the transaction: {e}")
    
    except ValueError as e:
        logger.error(f"Value error: {e}")
        raise ValueError(f"Error processing the transaction: {e}")
    
    except Exception as e:
        logger.exception(f"Unexpected error occurred: {e}")
        raise ValueError("An unexpected error occurred while processing the transaction.")

def refund_bingo_transaction(user, transaction_id):
    """Process a bingo transaction including balance updates and validation."""
    try:
        # Retrieve BingoUser instance for the current user
        try:
            bingo_user = BingoUser.objects.get(owner=user)
        except BingoUser.DoesNotExist:
            raise ValueError("BingoUser for the current user does not exist.")

        start_of_day, end_of_day = get_today_date()
        transaction = BingoTransaction.objects.get(transaction_id=transaction_id, daily_record__user__owner=user, created_at__range=(start_of_day, end_of_day))
        result = generate_result()
        transaction.result = result
        transaction.call_number = 0

        transaction.winners = ''
        transaction.ended = False
        transaction.refunded = True
        transaction.save()

        bingo_user.balance += transaction.cut
        bingo_user.save()

        print(f'Transaction created successfully: {transaction}')
        return transaction, result, bingo_user.balance

    except ObjectDoesNotExist as e:
        logger.error(f"Object does not exist: {e}")
        raise ValueError(f"Error processing the transaction: {e}")
    
    except ValueError as e:
        logger.error(f"Value error: {e}")
        raise ValueError(f"Error processing the transaction: {e}")
    
    except Exception as e:
        logger.exception(f"Unexpected error occurred: {e}")
        raise ValueError("An unexpected error occurred while processing the transaction.")

