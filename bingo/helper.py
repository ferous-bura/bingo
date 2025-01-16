import random
from decimal import Decimal
from django.utils.timezone import now
import logging
from decimal import Decimal
from django.core.exceptions import ObjectDoesNotExist
from .models import BingoUser, BingoDailyRecord, BingoTransaction
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

def process_bingo_transaction(user, cartella_list, bet_amount, game_type):
    """Process a bingo transaction including balance updates and validation."""
    try:
        # Fetch user information
        bingo_user = BingoUser.objects.get(owner=user)
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

        # Retrieve BingoUser instance for the current user
        try:
            bingo_user = BingoUser.objects.get(owner=user)
        except BingoUser.DoesNotExist:
            raise ValueError("BingoUser for the current user does not exist.")

        # Now use the BingoUser instance for get_or_create
        daily_record, created = BingoDailyRecord.objects.get_or_create(user=bingo_user, date=today)

        daily_record.total_winning = Decimal(daily_record.total_winning) + player_win
        daily_record.total_transactions += 1
        daily_record.total_cut = Decimal(daily_record.total_cut) + agent_cut
        daily_record.save()

        # Generate result and create transaction
        result = generate_result()
        transaction = BingoTransaction.objects.create(
            started=True,
            daily_record=daily_record,
            game_type=game_type,
            result=result,
            bet=bet_amount,
            player_number=len(cartella_list),
            total_won=Decimal(0),
            cut=agent_cut,
            won=player_win,
            call_number=0,
            winners=0
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

def check_bingo(transaction, submitted_cartella, call_number, game_pattern):
    print('checking winner')

    """
    Check if the submitted cartella is a winner based on the game pattern and result.
    """
    try:
        print(f"Checking bingo winner: transaction={transaction.id}, submitted_cartella={submitted_cartella}, call_number={call_number}")
        
        # Retrieve the relevant cartella
        if transaction.daily_record.user.branch == 'ahadu_bingo':
            try:
                cartella = ahadu_bingo[int(submitted_cartella) - 1]
                print(f"Retrieved cartella for 'ahadu_bingo': {cartella}")
            except IndexError as e:
                print(f"Error retrieving cartella for 'ahadu_bingo': {e}")
                return False
        else:
            cartella = submitted_cartella
            print(f"Retrieved cartella for other branch: {cartella}")
        
        # Ensure call number is enough to check
        if call_number < 5:
            print("Failed: call number is not enough for validation")
            return False

        # Slice result to the current call number
        current_result = transaction.result[:call_number]
        print(f"Current result (up to call number): {current_result}")

        # Match game pattern to the respective function
        pattern_checkers = {
            'full_house': is_full_house,
            'two_line': is_two_lines,
            'one_line': is_one_line,
            'corners': is_corners,
        }
        pattern_checker = pattern_checkers.get(transaction.game_pattern, is_full_house)
        print(f"Selected pattern checker: {transaction.game_pattern}")

        # Check the cartella against the pattern
        is_winner = pattern_checker(cartella, current_result)
        print(f"Pattern evaluation result: {is_winner}")
        return is_winner
    except Exception as e:
        print(f"Error in check_bingo_winner: {e}")
        return False

def is_full_house(cartella, result):
    """Check if all numbers in the cartella are in the result."""
    try:
        print(f"Checking Full House for cartella: {cartella}, result: {result}")
        return all(num in result for num in cartella)
    except Exception as e:
        print(f"Error in is_full_house: {e}")
        return False

def is_two_lines(cartella, result):
    """Check if two complete lines (rows) in the cartella are in the result."""
    try:
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        print(f"Checking Two Lines for cartella rows: {rows}, result: {result}")
        return sum(all(num in result for num in row) for row in rows) >= 2
    except Exception as e:
        print(f"Error in is_two_lines: {e}")
        return False

def is_one_line(cartella, result):
    """Check if at least one complete line (row) in the cartella is in the result."""
    try:
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        print(f"Checking One Line for cartella rows: {rows}, result: {result}")
        return any(all(num in result for num in row) for row in rows)
    except Exception as e:
        print(f"Error in is_one_line: {e}")
        return False

def is_corners(cartella, result):
    """Check if the four corners of the cartella are in the result."""
    try:
        corners = [cartella[0], cartella[4], cartella[20], cartella[24]]
        print(f"Checking Corners for cartella corners: {corners}, result: {result}")
        return all(num in result for num in corners)
    except Exception as e:
        print(f"Error in is_corners: {e}")
        return False
