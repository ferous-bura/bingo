const cartellaState = {
    selected: [],
    betAmount: 20,
    cutPercent: 25,
    get totalPayable() {
        const total = this.selected.length * this.betAmount;
        return total - (total * this.cutPercent) / 100;
    },
};

$(document).ready(function () {

    // Initialize numbers 1-100 in the grid
    const numberGrid = $('#cartellaGrid');
    for (let i = 1; i <= 100; i++) {
        const numberBox = $('<div class="card-box"></div>').text(i);
        numberGrid.append(numberBox);
    }

    // Update total payable and navigation dynamically
    function updateUI() {
        $('#totalPayable').text(`$${cartellaState.totalPayable.toFixed(2)}`);
        $('#totalSelectable').text(`${cartellaState.selected.length}`);
        $('#navCartellaCount').text(cartellaState.selected.length || '0');
        $('#navTotalPayable').text(`${cartellaState.totalPayable.toFixed(2)} Birr`);

        // Enable/Disable "Start Game" and "Select Cartella"
        if (cartellaState.selected.length > 0) {
            $('#startGame').prop('disabled', false);

        } else {
            $('#startGame').prop('disabled', true);
            $("#pauseGame").prop("disabled", true);
            $("#resetGame").prop("disabled", true);

        }
    }

    // Bet adjustment
    $('#increaseBet').on('click', function () {
        cartellaState.betAmount += 5;
        $('#bet').val(cartellaState.betAmount);
        updateUI();
    });

    $('#decreaseBet').on('click', function () {
        if (cartellaState.betAmount > 5) {
            cartellaState.betAmount -= 5;
            $('#bet').val(cartellaState.betAmount);
            updateUI();
        }
    });

    $('#bet').on('input', function () {
        cartellaState.betAmount = Math.max(5, $(this).val());
        $(this).val(cartellaState.betAmount);
        updateUI();
    });

    // Cartella selection
    $('#cartellaGrid').on('click', '.card-box', function () {
        $(this).toggleClass('selected');
        const number = $(this).text();
        if ($(this).hasClass('selected')) {
            cartellaState.selected.push(number);
        } else {
            cartellaState.selected = cartellaState.selected.filter((n) => n !== number);
        }
        updateUI();
    });

    // Clear selection
    $('#clearSelection').on('click', function () {
        $('.card-box').removeClass('selected');
        cartellaState.selected = [];
        $('#cartellaInput').val('');
        updateUI();
    });

    // Function to clear cartella selection
    function clearCartellaSelection() {
        $('.card-box').removeClass('selected');
        cartellaState.selected = [];
        $('#cartellaInput').val('');
        updateUI();
    }
    window.clearCartellaSelection = clearCartellaSelection;


    // Add Cartella functionality (same behavior as clicking number box)
    $('#addCartellaBtn').on('click', function () {
        addCartella();
    });

    // Add Cartella functionality triggered by Enter key press
    $('#cartellaInput').on('keypress', function (e) {
        if (e.which === 13) { // 13 is the Enter key
            addCartella();
        }
    });

    function addCartella() {
        const cartellaInput = $('#cartellaInput');
        const cartellaValue = parseInt(cartellaInput.val(), 10);

        if (cartellaValue && cartellaValue > 0) {
            // Find the corresponding number box in the grid with exact match
            const numberBox = $('#cartellaGrid').find('.card-box').filter(function () {
                return $(this).text().trim() == cartellaValue.toString();
            });

            if (numberBox.length > 0) {
                numberBox.toggleClass('selected'); // Toggle the selection

                // Update the cartellaState.selected array just like the grid click event
                if (numberBox.hasClass('selected')) {
                    cartellaState.selected.push(cartellaValue.toString());
                    // cartellaState.selected.push(cartellaValue.toString());
                } else {
                    cartellaState.selected = cartellaState.selected.filter((n) => n !== cartellaValue.toString());
                }

                // Clear the input field after adding the cartella
                cartellaInput.val('');
                updateUI();
            } else {
                alert('Cartella number not found on grid!');
            }
        } else {
            alert('Please enter a valid cartella number!');
        }
    }

    // Save selection
    $('#saveSelection').on('click', function () {
        console.log('Selected cartellas:', cartellaState.selected);
        console.log('Bet Amount:', cartellaState.betAmount);
        console.log('Total Payable:', cartellaState.totalPayable.toFixed(2));
        $('#cartellaModal').hide();
    });

    // Show modal
    $('#selectCartella').on('click', function () {
        $('#cartellaModal').show();
    });

    // Hide modal when clicking outside
    $(window).on('click', function (e) {
        if ($(e.target).is('#cartellaModal')) {
            $('#cartellaModal').hide();
        }
    });

    // Initial UI update
    updateUI();
});

// Close modal functionality when 'X' button is clicked
$('#closeModal').on('click', function () {
    $('#cartellaModal').hide(); // Hide the modal
});
