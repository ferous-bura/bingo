
$(document).ready(function () {
    // Define patterns
    const patterns = {
        default: [],
        any_two: [],
        full_house: Array.from({ length: 25 }, (_, i) => i + 1),
        two_line: [6, 7, 8, 9, 10, 16, 17, 18, 19, 20],
        one_line: [6, 7, 8, 9, 10],
        three_line: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 17, 18, 19, 20],
        four_line: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        corners: [1, 5, 21, 25],
        any_vertical: [1, 6, 11, 16, 21],
        any_horizontal: [1, 2, 3, 4, 5],
        any_2_vertical: [1, 6, 11, 16, 21, 2, 7, 12, 17, 22],
        any_2_horizontal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        any_diagonal: [1, 7, 13, 19, 25],
        any_1_corner: [1],
        any_2_corner: [1, 25],
        any_3_corner: [1, 5, 25],
        all_4_corners: [1, 5, 21, 25],
        any_2_lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        any_3_lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        "4_middle": [8, 12, 14, 18],
        inner_outer: [2, 4, 6, 10, 16, 20, 22, 24],
    };

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

        const activeCells = patterns[selectedPattern] || [];

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

    // Initialize with default pattern
    $("#gamePattern").trigger("change");
});