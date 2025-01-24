const cartellaState = {
    selected: JSON.parse(localStorage.getItem('selectedCartella')) || [],
    betAmount: parseInt(localStorage.getItem('betAmount'), 10) || 20,
    cutPercent: parseInt(localStorage.getItem('cutPercent'), 10) || 25,
    get totalPayable() {
        const total = this.selected.length * this.betAmount;
        return total - (total * this.cutPercent) / 100;
    },
    addToSelected(item) {
        if (!this.selected.includes(item)) {
            this.selected.push(item);
            this.saveSelected(); // Save to localStorage
        }
    },
    removeFromSelected(item) {
        const index = this.selected.indexOf(item);
        if (index > -1) {
            this.selected.splice(index, 1);
            this.saveSelected(); // Save to localStorage
        }
    },
    clearSelected() {
        this.selected = [];
        this.saveSelected(); // Save to localStorage
    },
    saveSelected() {
        localStorage.setItem('selectedCartella', JSON.stringify(this.selected));
    },
    saveBetAmount() {
        localStorage.setItem('betAmount', this.betAmount);
    },
    saveCutPercent() {
        localStorage.setItem('cutPercent', this.cutPercent);
    },
};

$(document).ready(function () {
    // Initialize numbers 1-100 in the grid
    const numberGrid = $('#cartellaGrid');
    const cartellasLen = $('#cartellasListLen').val();
    for (let i = 1; i <= cartellasLen; i++) {
        const numberBox = $('<div class="card-box"></div>').text(i);
        numberGrid.append(numberBox);
    }

    // Restore selected cartellas from localStorage
    cartellaState.selected.forEach((number) => {
        const numberBox = numberGrid.find('.card-box').filter(function () {
            return $(this).text().trim() === number;
        });
        numberBox.addClass('selected');
    });

    // Update total payable and navigation dynamically
    function updateUI() {
        $('#totalPayable').text(`${cartellaState.totalPayable.toFixed(2)} Birr`);
        $('#totalSelectable').text(`${cartellaState.selected.length}`);
        $('#navCartellaCount').text(`Total ${cartellaState.selected.length}` || 'Total 0');
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
        cartellaState.saveBetAmount(); // Save to localStorage
        $('#bet').val(cartellaState.betAmount);
        updateUI();
    });

    $('#decreaseBet').on('click', function () {
        if (cartellaState.betAmount > 5) {
            cartellaState.betAmount -= 5;
            cartellaState.saveBetAmount(); // Save to localStorage
            $('#bet').val(cartellaState.betAmount);
            updateUI();
        }
    });

    $('#bet').on('input', function () {
        cartellaState.betAmount = Math.max(5, parseInt($(this).val(), 10) || 5);
        cartellaState.saveBetAmount(); // Save to localStorage
        $(this).val(cartellaState.betAmount);
        updateUI();
    });

    // Cartella selection
    $('#cartellaGrid').on('click', '.card-box', function () {
        $(this).toggleClass('selected');
        const number = $(this).text();
        if ($(this).hasClass('selected')) {
            cartellaState.addToSelected(number);
        } else {
            cartellaState.removeFromSelected(number);
        }
        updateUI();
    });

    // Clear selection
    $('#clearSelection').on('click', function () {
        $('.card-box').removeClass('selected');
        cartellaState.clearSelected();
        $('#cartellaInput').val('');
        updateUI();
    });

    // Function to clear cartella selection
    function clearCartellaSelection() {
        $('.card-box').removeClass('selected');
        cartellaState.clearSelected();
        $('#cartellaInput').val('');
        updateUI();
    }
    window.clearCartellaSelection = clearCartellaSelection;

    // Add Cartella functionality
    function addCartella() {
        const cartellaInput = $('#cartellaInput');
        const cartellaValue = parseInt(cartellaInput.val(), 10);

        if (cartellaValue && cartellaValue > 0) {
            const numberBox = $('#cartellaGrid').find('.card-box').filter(function () {
                return $(this).text().trim() == cartellaValue.toString();
            });

            if (numberBox.length > 0) {
                numberBox.toggleClass('selected');

                if (numberBox.hasClass('selected')) {
                    cartellaState.addToSelected(cartellaValue.toString());
                } else {
                    cartellaState.removeFromSelected(cartellaValue.toString());
                }

                cartellaInput.val('');
                updateUI();
            } else {
                showModalAlert('Cartella number not found on grid!');
            }
        } else {
            showModalAlert('Please enter a valid cartella number!');
        }
    }

    $('#addCartellaBtn').on('click', function () {
        addCartella();
    });

    $('#cartellaInput').on('keypress', function (e) {
        if (e.which === 13) {
            addCartella();
        }
    });

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
    $('#cartellaModal').hide();
});
