from .card_lists import ahadu_bingo, hagere_bingo


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
        # Retrieve the relevant cartella
        elif transaction.daily_record.user.branch == 'hagere_bingo':
            try:
                cartella = hagere_bingo[int(submitted_cartella) - 1]
                print(f"Retrieved cartella for 'hagere_bingo': {cartella}")
            except IndexError as e:
                print(f"Error retrieving cartella for 'hagere_bingo': {e}")
                return False
        else:
            raise ValueError('Branch not found')

        # Ensure call number is enough to check
        if call_number < 5:
            print("Failed: call number is not enough for validation")
            return False

        # Slice result to the current call number
        current_result = transaction.result[:call_number]
        current_result.append(0)
        print(f"Current result (up to call number): {current_result}")

        # Match game pattern to the respective function
        pattern_checkers = {
            'default': is_default_pattern,
            'any_two': any_two_pattern,
            'full_house': is_full_house,
            'one_line': is_one_line,
            'two_line': is_two_lines,
            'three_line': is_three_lines,
            'four_line':is_four_lines,
            'corners': is_corners,
            'any_vertical': is_any_vertical,
            'any_horizontal':is_any_horizontal,
            'any_diagonal':is_any_diagonal,
            'any_2_vertical':is_any_2_vertical,
            'any_2_horizontal':is_any_2_horizontal,
            'any_2_diagonal':is_any_two_diagonal,

            'four_middle':is_middle_four,
            'inner_outer':is_inner_and_outer,

            # 'any_1_corner':is_any_1_corner,
            # 'any_2_corner':is_any_2_corner,
            # 'any_3_corner':is_any_3_corner,
            # 'all_4_corners':is_all_4_corners,
        }
        pattern_checker = pattern_checkers.get(game_pattern) #, is_full_house
        print(f"Selected pattern checker: {game_pattern}")

        # Check the cartella against the pattern
        is_winner = pattern_checker(cartella, current_result)
        return is_winner

    except Exception as e:
        print(f"Error in check_bingo_winner: {e}")
        return False

def is_default_pattern(cartella, result):
    """Check if the cartella matches the main default pattern: 
    One Line Any or One Diagonal (either diagonal)."""
    try:
        # Check One Line Any (row, column, or diagonal)
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        columns = [[cartella[i + col] for i in range(0, 25, 5)] for col in range(5)]
        diagonals = [
            [cartella[i * 5 + i] for i in range(5)],  # Top-left to bottom-right
            [cartella[(i + 1) * 4] for i in range(5)]  # Top-right to bottom-left
        ]
        # print(f'rows {rows}')
        # print(f'columns {columns}')
        # print(f'diagonals {diagonals}')

        # Check if any row, column, or diagonal is fully marked
        one_line_check = any(all(num in result for idx, num in enumerate(line)) 
                             for line in rows + columns + diagonals)
        # one_line_check = any(all(num in result or (idx == 12 and num == cartella[12]) for idx, num in enumerate(line)) 
        #                      for line in rows + columns + diagonals)

        # Check if any diagonal is fully marked
        one_diagonal_check = any(all(num in result for idx, num in enumerate(diag)) 
                                 for diag in diagonals)

        # print(f'one_line_check {one_line_check}')
        # print(f'one_diagonal_check {one_diagonal_check}')

        return one_line_check or one_diagonal_check
    except Exception as e:
        print(f"Error in is_default_pattern: {e}")
        return False

def any_two_pattern(cartella, result):
    """Check if the cartella matches the pair default pattern: 
    Two Lines Any or Two Diagonal X."""
    try:
        # Check Two Lines Any (rows or columns)
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        columns = [[cartella[i + col] for i in range(0, 25, 5)] for col in range(5)]
        
        # Check if both diagonals (X shape) are fully marked
        diagonals = [
            [cartella[i * 5 + i] for i in range(5)],  # Top-left to bottom-right
            [cartella[(i + 1) * 4] for i in range(5)]  # Top-right to bottom-left
        ]

        all_shapes = rows + columns + diagonals
        print(f'all shapes {all_shapes}')

        passed_lines = []

        for line in all_shapes:
            if all(num in result for num in line):
                passed_lines.append(line)

        # # Print the lines that passed
        # for line in passed_lines:
        #     print("Passed line:", line)

        # Check if two_line_check is satisfied
        two_line_check = len(passed_lines) >= 2
        # print("Two line check:", two_line_check)

        return two_line_check
    except Exception as e:
        print(f"Error in is_pair_default_pattern: {e}")
        return False

def is_full_house(cartella, result):
    """Check if all numbers in the cartella are in the result, excluding the middle space."""
    try:
        print(f"Checking Full House for cartella: {cartella}, result: {result}")
        return all(num in result for idx, num in enumerate(cartella))
    except Exception as e:
        print(f"Error in is_full_house: {e}")
        return False

def is_one_line(cartella, result):
    """Check if at least one complete line (row) in the cartella is in the result, with a free middle space."""
    try:
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        columns = [[cartella[i + col] for i in range(0, 25, 5)] for col in range(5)]
        print(f"Checking One Line for cartella rows: {rows}, result: {result}")
        return any(all(num in result for idx, num in enumerate(row)) for row in rows + columns)
    except Exception as e:
        print(f"Error in is_one_line: {e}")
        return False

def is_two_lines(cartella, result):
    """Check if two complete lines (rows) in the cartella are in the result, with a free middle space."""
    try:
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        columns = [[cartella[i + col] for i in range(0, 25, 5)] for col in range(5)]
        
        print(f"Checking Two Lines for cartella rows: {rows}, result: {result}")
        return sum(all(num in result for idx, num in enumerate(row)) for row in rows + columns) >= 2
    except Exception as e:
        print(f"Error in is_two_lines: {e}")
        return False

def is_three_lines(cartella, result):
    """Check if three complete lines in the cartella are in the result, with a free middle space."""
    try:
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        columns = [[cartella[i + col] for i in range(0, 25, 5)] for col in range(5)]
        print(f"Checking Three Lines for cartella rows: {rows}, result: {result}")
        return sum(all(num in result for idx, num in enumerate(row)) for row in rows + columns) >= 3
    except Exception as e:
        print(f"Error in is_three_lines: {e}")
        return False

def is_four_lines(cartella, result):
    """Check if four complete lines in the cartella are in the result, with a free middle space."""
    try:
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        columns = [[cartella[i + col] for i in range(0, 25, 5)] for col in range(5)]
        print(f"Checking Four Lines for cartella rows: {rows}, result: {result}")
        return sum(all(num in result for idx, num in enumerate(row)) for row in rows + columns) >= 4
    except Exception as e:
        print(f"Error in is_four_lines: {e}")
        return False

def is_corners(cartella, result):
    """Check if the four corners of the cartella are in the result."""
    try:
        corners = [cartella[0], cartella[4], cartella[20], cartella[24]]  # Middle space not involved here
        print(f"Checking Corners for cartella corners: {corners}, result: {result}")

        return all(num in result for num in corners)
    except Exception as e:
        print(f"Error in is_corners: {e}")
        return False

def is_any_vertical(cartella, result):
    """Check if any vertical column in the cartella is in the result, with a free middle space."""
    try:
        columns = [[cartella[i + col] for i in range(0, 25, 5)] for col in range(5)]
        print(f"Checking Any Vertical for cartella columns: {columns}, result: {result}")
        return any(all(num in result for idx, num in enumerate(col)) for col in columns)
    except Exception as e:
        print(f"Error in is_any_vertical: {e}")
        return False

def is_any_horizontal(cartella, result):
    """Check if any horizontal row in the cartella is in the result, with a free middle space."""
    try:
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        print(f"Checking Any Horizontal for cartella rows: {rows}, result: {result}")
        return any(all(num in result for idx, num in enumerate(row)) for row in rows)
    except Exception as e:
        print(f"Error in is_any_horizontal: {e}")
        return False

def is_any_2_vertical(cartella, result):
    """Check if any 2 vertical columns in the cartella are in the result, with a free middle space."""
    try:
        columns = [[cartella[i + col] for i in range(0, 25, 5)] for col in range(5)]
        print(f"Checking Any 2 Vertical for cartella columns: {columns}, result: {result}")
        
        return sum(all(num in result for idx, num in enumerate(col)) for col in columns) >= 2
    except Exception as e:
        print(f"Error in is_any_2_vertical: {e}")
        return False

def is_any_2_horizontal(cartella, result):
    """Check if any 2 horizontal lines in the cartella are in the result, with a free middle space."""
    try:
        rows = [cartella[i:i + 5] for i in range(0, len(cartella), 5)]
        print(f"Checking Any 2 Horizontal for cartella rows: {rows}, result: {result}")

        return sum(all(num in result for idx, num in enumerate(row)) for row in rows) >= 2
    except Exception as e:
        print(f"Error in is_any_2_horizontal: {e}")
        return False

def is_any_diagonal(cartella, result):
    """Check if any diagonal in the cartella is fully in the result, with a free middle space."""
    try:
        diagonals = [
            [cartella[i * 5 + i] for i in range(5)],  # Top-left to bottom-right
            [cartella[(i + 1) * 4] for i in range(5)]  # Top-right to bottom-left
        ]
        print(f"Checking Any Diagonal for cartella diagonals: {diagonals}, result: {result}")
        return any(all(num in result for idx, num in enumerate(diag)) for diag in diagonals)
    except Exception as e:
        print(f"Error in is_any_diagonal: {e}")
        return False

def is_any_two_diagonal(cartella, result):
    """Check if any diagonal in the cartella is fully in the result, with a free middle space."""
    try:
        diagonals = [
            [cartella[i * 5 + i] for i in range(5)],  # Top-left to bottom-right
            [cartella[(i + 1) * 4] for i in range(5)]  # Top-right to bottom-left
        ]
        print(f"Checking Any Diagonal for cartella diagonals: {diagonals}, result: {result}")
        return sum(all(num in result for idx, num in enumerate(diag)) for diag in diagonals) >= 2
    except Exception as e:
        print(f"Error in is_any_diagonal: {e}")
        return False

def is_middle_four(cartella, result):
    """Check if the 4 middle numbers around the free space are in the result."""
    try:
        middle_four = [cartella[6], cartella[8], cartella[16], cartella[18]]
        print(f"Checking Middle Four for cartella: {middle_four}, result: {result}")
        return all(num in result for num in middle_four)  # Middle itself is already free
    except Exception as e:
        print(f"Error in is_middle_four: {e}")
        return False

def is_inner_and_outer(cartella, result):
    """Check if both the inner 4 numbers around the middle and the 4 corners are in the result."""
    try:
        corners = [cartella[0], cartella[4], cartella[20], cartella[24]]
        inner_four = [cartella[6], cartella[8], cartella[16], cartella[18]]
        print(f"Checking Inner and Outer for cartella: corners={corners}, inner_four={inner_four}, result: {result}")
        return all(num in result for num in corners + inner_four)
    except Exception as e:
        print(f"Error in is_inner_and_outer: {e}")
        return False

# def is_any_1_corner(cartella, result):
#     """Check if any 1 corner square in the cartella is in the result."""
#     try:
#         corners = [cartella[0], cartella[4], cartella[20], cartella[24]]
#         print(f"Checking Any 1 Corner for cartella corners: {corners}, result: {result}")
#         return any(num in result for idx, num in enumerate(corners))
#     except Exception as e:
#         print(f"Error in is_any_1_corner: {e}")
#         return False

# def is_any_2_corner(cartella, result):
#     """Check if any 2 corner squares in the cartella are in the result."""
#     try:
#         corners = [cartella[0], cartella[4], cartella[20], cartella[24]]
#         print(f"Checking Any 2 Corner for cartella corners: {corners}, result: {result}")
#         return sum(num in result for idx, num in enumerate(corners)) >= 2
#     except Exception as e:
#         print(f"Error in is_any_2_corner: {e}")
#         return False

# def is_any_3_corner(cartella, result):
#     """Check if any 3 corner squares in the cartella are in the result."""
#     try:
#         corners = [cartella[0], cartella[4], cartella[20], cartella[24]]
#         print(f"Checking Any 3 Corner for cartella corners: {corners}, result: {result}")
#         return sum(num in result for idx, num in enumerate(corners)) >= 3
#     except Exception as e:
#         print(f"Error in is_any_3_corner: {e}")
#         return False
# def is_all_4_corners(cartella, result):
#     """Check if all 4 corner squares in the cartella are in the result."""
#     try:
#         corners = [cartella[0], cartella[4], cartella[20], cartella[24]]
#         print(f"Checking All 4 Corners for cartella corners: {corners}, result: {result}")
#         return all(num in result for idx, num in enumerate(corners))
#     except Exception as e:
#         print(f"Error in is_all_4_corners: {e}")
#         return False
