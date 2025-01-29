const patterns = {
    // Single Line Patterns
    one_line: [
        [0, 1, 2, 3, 4],    // First row
        [5, 6, 7, 8, 9],    // Second row
        [10, 11, 12, 13, 14], // Third row
        [15, 16, 17, 18, 19], // Fourth row
        [20, 21, 22, 23, 24],  // Fifth row
        [0, 5, 10, 15, 20],  // First column
        [1, 6, 11, 16, 21],  // Second column
        [2, 7, 12, 17, 22],  // Third column
        [3, 8, 13, 18, 23],  // Fourth column
        [4, 9, 14, 19, 24],  // Fifth column
        [0, 6, 12, 18, 24],  // Diagonal (top-left to bottom-right)
        [4, 8, 12, 16, 20]   // Diagonal (top-right to bottom-left)
    ],

    // Two Lines Patterns
    two_lines: [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // First and Second rows
        [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // Third and Fourth rows
        [0, 1, 2, 3, 4, 20, 21, 22, 23, 24], // First and Fifth rows
        [0, 5, 10, 15, 20, 1, 6, 11, 16, 21], // First and Second columns
        [2, 7, 12, 17, 22, 3, 8, 13, 18, 23], // Third and Fourth columns
        [0, 5, 10, 15, 20, 4, 9, 14, 19, 24], // First and Fifth columns
        [0, 1, 2, 3, 4, 0, 5, 10, 15, 20], // First row and First column
        [4, 9, 14, 19, 24, 20, 21, 22, 23, 24], // Fifth row and Fifth column
        [0, 6, 12, 18, 24, 4, 8, 12, 16, 20] // Both diagonals
    ],

    // Three Lines Patterns
    three_lines: [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // First, Second, and Third rows
        [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // Second, Third, and Fourth rows
        [0, 1, 2, 3, 4, 10, 11, 12, 13, 14, 20, 21, 22, 23, 24], // First, Third, and Fifth rows
        [0, 5, 10, 15, 20, 1, 6, 11, 16, 21, 2, 7, 12, 17, 22], // First, Second, and Third columns
        [1, 6, 11, 16, 21, 2, 7, 12, 17, 22, 3, 8, 13, 18, 23], // Second, Third, and Fourth columns
        [0, 5, 10, 15, 20, 2, 7, 12, 17, 22, 4, 9, 14, 19, 24], // First, Third, and Fifth columns
        [0, 1, 2, 3, 4, 0, 5, 10, 15, 20, 4, 9, 14, 19, 24], // First row, First column, and Fifth column
        [0, 6, 12, 18, 24, 4, 8, 12, 16, 20, 0, 1, 2, 3, 4] // Both diagonals and First row
    ],

    // Four Lines Patterns
    four_lines: [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // First, Second, Third, and Fourth rows
        [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], // Second, Third, Fourth, and Fifth rows
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], // First, Second, Fourth, and Fifth rows
        [0, 5, 10, 15, 20, 1, 6, 11, 16, 21, 2, 7, 12, 17, 22, 3, 8, 13, 18, 23], // First, Second, Third, and Fourth columns
        [1, 6, 11, 16, 21, 2, 7, 12, 17, 22, 3, 8, 13, 18, 23, 4, 9, 14, 19, 24], // Second, Third, Fourth, and Fifth columns
        [0, 5, 10, 15, 20, 1, 6, 11, 16, 21, 3, 8, 13, 18, 23, 4, 9, 14, 19, 24], // First, Second, Fourth, and Fifth columns
        [0, 1, 2, 3, 4, 0, 5, 10, 15, 20, 4, 9, 14, 19, 24, 20, 21, 22, 23, 24], // First row, First column, Fifth column, and Fifth row
        [0, 6, 12, 18, 24, 4, 8, 12, 16, 20, 0, 1, 2, 3, 4, 20, 21, 22, 23, 24] // Both diagonals, First row, and Fifth row
    ],

    // Full House Pattern
    full_house: [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] // All cells
    ],

    // Corners Pattern
    corners: [
        [0, 4, 20, 24] // All four corners
    ],

    // Middle Square Pattern
    middle_square: [
        [6, 7, 8, 11, 12, 13, 16, 17, 18] // Middle 3x3 square
    ],

    // Cross Pattern
    cross: [
        [0, 6, 12, 18, 24, 4, 8, 12, 16, 20] // Both diagonals
    ],

    // Outer Square Pattern
    outer_square: [
        [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24] // Outer square
    ],

    // Inner Square Pattern
    inner_square: [
        [6, 7, 8, 11, 12, 13, 16, 17, 18] // Inner 3x3 square
    ],

    // Letter Patterns (e.g., 'B', 'I', 'N', 'G', 'O')
    letterB: [
        [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24] // Letter 'B'
    ],
    letterI: [
        [0, 5, 10, 15, 20, 4, 9, 14, 19, 24] // Letter 'I'
    ],
    letterN: [
        [0, 5, 10, 15, 20, 4, 9, 14, 19, 24, 1, 6, 11, 16, 21, 3, 8, 13, 18, 23] // Letter 'N'
    ],
    letterG: [
        [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24] // Letter 'G'
    ],
    letterO: [
        [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24] // Letter 'O'
    ]
};

$(document).ready(function () {
    // Define all possible lines
    const lines = {
        horizontal: [
            [1, 2, 3, 4, 5],    // First row
            [6, 7, 8, 9, 10],   // Second row
            [11, 12, 13, 14, 15], // Third row
            [16, 17, 18, 19, 20], // Fourth row
            [21, 22, 23, 24, 25]  // Fifth row
        ],
        vertical: [
            [1, 6, 11, 16, 21],  // First column
            [2, 7, 12, 17, 22],  // Second column
            [3, 8, 13, 18, 23],  // Third column
            [4, 9, 14, 19, 24],  // Fourth column
            [5, 10, 15, 20, 25]  // Fifth column
        ],
        diagonal: [
            [1, 7, 13, 19, 25],  // Top-left to bottom-right
            [5, 9, 13, 17, 21]   // Top-right to bottom-left
        ]
    };

    // Define patterns
    const patterns = {
        default: [], // Will be dynamically generated
        any_two: [], // Will be dynamically generated
        full_house: Array.from({ length: 25 }, (_, i) => i + 1),
        one_line: [], // Will be dynamically generated
        two_line: [], // Will be dynamically generated
        three_line: [], // Will be dynamically generated
        four_line: [], // Will be dynamically generated
        corners: [1, 5, 21, 25], // No change
        any_vertical: [], // Will be dynamically generated
        any_horizontal: [], // Will be dynamically generated
        any_diagonal: [], // Will be dynamically generated
        any_2_vertical: [], // Will be dynamically generated
        any_2_horizontal: [], // Will be dynamically generated
        any_2_diagonal: [], // Will be dynamically generated
        four_middle: [7, 9, 17, 19], // No change
        inner_outer: [1, 5, 7, 9, 17, 19, 21, 25], // No change
    };

    // Helper function to get a random line (excluding diagonals if specified)
    function getRandomLine(excludeDiagonal = false) {
        const allLines = excludeDiagonal
            ? [...lines.horizontal, ...lines.vertical] // Exclude diagonals
            : [...lines.horizontal, ...lines.vertical, ...lines.diagonal]; // Include diagonals
        return allLines[Math.floor(Math.random() * allLines.length)];
    }

    // Helper function to get N random lines (excluding diagonals if specified)
    function getNRandomLines(n, excludeDiagonal = false) {
        const allLines = excludeDiagonal
            ? [...lines.horizontal, ...lines.vertical] // Exclude diagonals
            : [...lines.horizontal, ...lines.vertical, ...lines.diagonal]; // Include diagonals

        const selectedLines = [];
        while (selectedLines.length < n) {
            const randomLine = allLines[Math.floor(Math.random() * allLines.length)];
            if (!selectedLines.some(line => line.join() === randomLine.join())) {
                selectedLines.push(randomLine);
            }
        }

        return selectedLines.flat(); // Flatten the array of lines into a single array
    }

    // Handle pattern change
    $("#gamePattern").on("change", function () {
        const selectedPattern = $(this).val();

        // If no pattern is selected, hide grid
        if (!selectedPattern) {
            $("#bingoContainer").hide();
            return;
        }

        // Show grid
        $("#bingoContainer").show();

        let activeCells = [];

        // Dynamically generate patterns for specific options
        switch (selectedPattern) {
            case "default":
                activeCells = getRandomLine(); // Randomize default pattern
                break;
            case "any_two":
                activeCells = getNRandomLines(2); // Randomize any two lines
                break;
            case "one_line":
                activeCells = getRandomLine(true); // Randomize one line (exclude diagonals)
                break;
            case "two_line":
                activeCells = getNRandomLines(2, true); // Randomize two lines (exclude diagonals)
                break;
            case "three_line":
                activeCells = getNRandomLines(3, true); // Randomize three lines (exclude diagonals)
                break;
            case "four_line":
                activeCells = getNRandomLines(4, true); // Randomize four lines (exclude diagonals)
                break;
            case "any_vertical":
                activeCells = lines.vertical[Math.floor(Math.random() * lines.vertical.length)]; // Randomize one vertical line
                break;
            case "any_horizontal":
                activeCells = lines.horizontal[Math.floor(Math.random() * lines.horizontal.length)]; // Randomize one horizontal line
                break;
            case "any_diagonal":
                activeCells = lines.diagonal[Math.floor(Math.random() * lines.diagonal.length)]; // Randomize one diagonal line
                break;
            case "any_2_vertical":
                activeCells = getNRandomLines(2, true).filter(cell => lines.vertical.flat().includes(cell)); // Randomize two vertical lines
                break;
            case "any_2_horizontal":
                activeCells = getNRandomLines(2, true).filter(cell => lines.horizontal.flat().includes(cell)); // Randomize two horizontal lines
                break;
            case "any_2_diagonal":
                activeCells = getNRandomLines(2).filter(cell => lines.diagonal.flat().includes(cell)); // Randomize two diagonal lines
                break;
            default:
                activeCells = patterns[selectedPattern] || []; // Use predefined patterns for others
                break;
        }

        // Clear all cells
        $(".pattern-bingo-cell").removeClass("active");

        // Highlight cells in the selected pattern
        activeCells.forEach((cellIndex) => {
            $(`.pattern-bingo-cell[data-index="${cellIndex}"]`).addClass("active");
        });
    });

    // Clear patterns
    $("#clearPatterns").on("click", function () {
        $(".pattern-bingo-cell").removeClass("active");
    });

    // Randomize patterns
    $("#randomizePattern").on("click", function () {
        const selectedPattern = $("#gamePattern").val();

        // Only randomize if the selected pattern supports it
        if ([
            "default",
            "any_two",
            "one_line",
            'two_line',
            'three_line',
            'four_line',
            'any_vertical',
            'any_horizontal',
            'any_diagonal',
            'any_2_vertical',
            'any_2_horizontal'].includes(selectedPattern)) {
            $("#gamePattern").trigger("change");
        }
    });

    let intervalId; // Declare a variable to store the interval ID

// Start the interval when the modal is opened
$('#bingoPatternModal').on('shown.bs.modal', function () {
    intervalId = setInterval(function () {
        // Initialize with default pattern
        $("#gamePattern").trigger("change");
    }, 1000);
});

// Clear the interval when the modal is closed
$('#bingoPatternModal').on('hidden.bs.modal', function () {
    if (intervalId) {
        clearInterval(intervalId); // Clear the interval
        intervalId = null; // Reset the variable
    }
});


});