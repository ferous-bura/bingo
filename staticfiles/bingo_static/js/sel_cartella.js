$(document).ready(function () {
    const cartellaState = {
        selected: [],
        betAmount: 20,
        cutPercent: 25,
        get totalPayable() {
            const total = this.selected.length * this.betAmount;
            return total - (total * this.cutPercent) / 100;
        },
    };

    // Initialize numbers 1-100 in the grid
    const numberGrid = $('#cartellaGrid');
    for (let i = 1; i <= 100; i++) {
        const numberBox = $('<div class="card-box"></div>').text(i);
        numberGrid.append(numberBox);
    }

    // Function to update UI
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

    // Function to adjust the bet amount
    function adjustBet(amount) {
        cartellaState.betAmount = Math.max(5, cartellaState.betAmount + amount);
        $('#bet').val(cartellaState.betAmount);
        updateUI();
    }

    // Function to add/remove cartella
    function toggleCartella(numberBox, number) {
        numberBox.toggleClass('selected');
        if (numberBox.hasClass('selected')) {
            cartellaState.selected.push(number.toString());
        } else {
            cartellaState.selected = cartellaState.selected.filter((n) => n !== number.toString());
        }
        updateUI();
    }

    // Function to clear cartella selection
    function clearCartellaSelection() {
        $('.card-box').removeClass('selected');
        cartellaState.selected = [];
        $('#cartellaInput').val('');
        updateUI();
    }

    // Function to save selection
    function saveSelection() {
        console.log('Selected cartellas:', cartellaState.selected);
        console.log('Bet Amount:', cartellaState.betAmount);
        console.log('Total Payable:', cartellaState.totalPayable.toFixed(2));
        $('#cartellaModal').hide();
    }

    // Event Listeners

    // Increase and decrease bet amount
    $('#increaseBet').on('click', () => adjustBet(5));
    $('#decreaseBet').on('click', () => adjustBet(-5));
    $('#bet').on('input', function () {
        cartellaState.betAmount = Math.max(5, $(this).val());
        $(this).val(cartellaState.betAmount);
        updateUI();
    });

    // Toggle cartella on click
    $('#cartellaGrid').on('click', '.card-box', function () {
        toggleCartella($(this), $(this).text());
    });

    // Clear selection
    $('#clearSelection').on('click', clearCartellaSelection);

    // Save selection
    $('#saveSelection').on('click', saveSelection);

    // Show modal
    $('#selectCartella').on('click', function () {
        $('#cartellaModal').show();
    });

    // Add cartella by input
    $('#addCartellaBtn').on('click', function () {
        addCartella();
    });

    $('#cartellaInput').on('keypress', function (e) {
        if (e.which === 13) {
            addCartella();
        }
    });

    function addCartella() {
        const cartellaInput = $('#cartellaInput');
        const cartellaValue = parseInt(cartellaInput.val(), 10);

        if (cartellaValue && cartellaValue > 0) {
            const numberBox = $('#cartellaGrid').find('.card-box').filter(function () {
                return $(this).text().trim() == cartellaValue.toString();
            });

            if (numberBox.length > 0) {
                toggleCartella(numberBox, cartellaValue); // Use reusable function
                cartellaInput.val('');
            } else {
                alert('Cartella number not found on grid!');
            }
        } else {
            alert('Please enter a valid cartella number!');
        }
    }

    // Hide modal on clicking outside or close button
    $('#closeModal').on('click', () => $('#cartellaModal').hide());
    $(window).on('click', function (e) {
        if ($(e.target).is('#cartellaModal')) {
            $('#cartellaModal').hide();
        }
    });

    // Initial UI update
    updateUI();
});
