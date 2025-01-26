import random
from decimal import Decimal
from django.utils.timezone import now
import logging
from decimal import Decimal
from django.core.exceptions import ObjectDoesNotExist
from .models import BingoUser, BingoDailyRecord, BingoTransaction, Notification
from django.utils.timezone import now

from .models import BingoTransaction, BingoDailyRecord, BingoUser
from .card_lists import ahadu_bingo, hagere_bingo
logger = logging.getLogger(__name__)

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

def process_bingo_transaction(user, cartella_list, bet_amount, game_type, game_pattern, transaction_id):
    """Process a bingo transaction including balance updates and validation."""
    try:
        # Retrieve BingoUser instance for the current user
        try:
            bingo_user = BingoUser.objects.get(owner=user)
        except BingoUser.DoesNotExist:
            raise ValueError("BingoUser for the current user does not exist.")

        bet_amount = Decimal(bet_amount)  # Ensure bet_amount is a Decimal
        
        win = bet_amount * Decimal(len(cartella_list))
        agent_cut = (win * Decimal(bingo_user.cut_percentage)) / Decimal(100)
        player_win = win - agent_cut

        # Debug log for data processing
        print(f'Processing bingo transaction. balance: {Decimal(bingo_user.balance)}, user={user}, bet_amount={bet_amount}, win={win}, '
                     f'agent_cut={agent_cut}, player_win={player_win}, cartella_list={cartella_list}')

        # Check if the user has enough balance
        if Decimal(bingo_user.balance) < agent_cut:
            raise ValueError("Insufficient balance.")

        valid_cartellas = range(0, 150)  # Assuming cartella numbers should be within 0-149
        # if not validate_cartellas(cartella_list, valid_cartellas):
        #     raise ValueError("Invalid cartella selection.")

        # Update user balance
        bingo_user.balance = Decimal(bingo_user.balance) - agent_cut
        bingo_user.save()

        # Update or create the daily record
        today = now().date()

        # Now use the BingoUser instance for get_or_create
        daily_record, created = BingoDailyRecord.objects.get_or_create(user=bingo_user, date=today)

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
        }

        if transaction_id:
            BingoTransaction.objects.filter(transaction_id=transaction_id).update(**defaults)
            transaction = BingoTransaction.objects.get(transaction_id=transaction_id)
            print(f'Transaction updated successfully: {transaction}')
        else:
            transaction_id = daily_record.total_transactions
            transaction = BingoTransaction.objects.create(
                transaction_id=transaction_id,
                **defaults
            )
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

def refund_bingo_transaction(user, transaction_id):
    """Process a bingo transaction including balance updates and validation."""
    try:
        # Retrieve BingoUser instance for the current user
        try:
            bingo_user = BingoUser.objects.get(owner=user)
        except BingoUser.DoesNotExist:
            raise ValueError("BingoUser for the current user does not exist.")
        
        transaction = BingoTransaction.objects.get(transaction_id=transaction_id, daily_record__user__owner=user)
        result = generate_result()
        transaction.result = result
        transaction.call_number = 0
        transaction.winners = ''
        transaction.ended = False
        transaction.refunded = True
        transaction.save()

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

