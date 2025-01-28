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

    // Initialize with default pattern
    $("#gamePattern").trigger("change");
});