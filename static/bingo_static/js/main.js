// import { clearCartellaSelection } from './cartella.js';

// clearCartellaSelection();

$(document).ready(function () {
    const columns = {
        B: Array.from({ length: 15 }, (_, i) => i + 1),
        I: Array.from({ length: 15 }, (_, i) => i + 16),
        N: Array.from({ length: 15 }, (_, i) => i + 31),
        G: Array.from({ length: 15 }, (_, i) => i + 46),
        O: Array.from({ length: 15 }, (_, i) => i + 61)
    };

    let gameSpeed = parseInt(localStorage.getItem('gameSpeed')) || 3000; // Default to 3000ms
    let gameInterval;
    let isGameRunning = false;
    let transactionId = null;
    let isGamePaused = false;
    let resultIndex = 0; // Used for tracking the current number in the predefined sequence
    // Default settings if nothing is stored
    let voiceChoice = localStorage.getItem('voiceChoice') || 'female'; // Default to female
    let totalCalls = 0; // To track the total number of calls
    let previousCall = 0; // To store the last called number
    // selected cartella states
    let resultNumbers = null;

    // // Helper to get CSRF token and check unfinished transaction id
    // function checkUnfinishedTransactionId() {
    //     const unfinishedTransactionId = document.querySelector("[name=unfinished_transaction_id]").value;
    //     console.log('unfinishedTransactionId', unfinishedTransactionId);

    //     if (unfinishedTransactionId) {
    //         document.querySelector("[name=unfinished_transaction_id]").value = '';
    //         return unfinishedTransactionId;
    //     } else {
    //         return null;
    //     }
    // }

    // // Call the function once to check and set value
    // const transactionId = checkUnfinishedTransactionId();
    // if (transactionId != null) {
    //     console.log('transactionId', transactionId);
    //     isGameRunning = true;
    //     isGamePaused = false;
    // }

    // Function to play audio based on the selected voice
    function playAudio(fileName) {
        const male_audio = new Audio(`/static/bingo_static/audio/amharic/male/${fileName}`);
        const female_audio = new Audio(`/static/bingo_static/audio/amharic/female/${fileName}`);

        // Play the selected voice
        if (voiceChoice === 'female') {
            female_audio.play().catch(error => {
                console.error(`Audio file not found: ${fileName}`, error);
            });
        } else {
            male_audio.play().catch(error => {
                console.error(`Audio file not found: ${fileName}`, error);
            });
        }
    }

    // Voice selection handlers
    $('#maleVoice').on('click', function () {
        voiceChoice = 'male'; // Set to male voice
        localStorage.setItem('voiceChoice', voiceChoice); // Save choice to localStorage
    });

    $('#femaleVoice').on('click', function () {
        voiceChoice = 'female'; // Set to female voice
        localStorage.setItem('voiceChoice', voiceChoice); // Save choice to localStorage
    });

    // Initialize the slider for game speed
    $("#slider").slider({
        min: 1000, // Minimum speed (faster)
        max: 10000, // Maximum speed (slower)
        value: gameSpeed, // Set the slider to saved game speed
        step: 500, // Increment steps
        slide: function (event, ui) {
            gameSpeed = ui.value; // Update game speed
            $("#speedValue").text(gameSpeed); // Display updated speed
            localStorage.setItem('gameSpeed', gameSpeed); // Save game speed to localStorage
            console.log('Game speed is', gameSpeed);
        },
    });

    // Set initial voice selection visually
    if (voiceChoice === 'male') {
        $('#maleVoice').addClass('selected');
    } else {
        $('#femaleVoice').addClass('selected');
    }

    // Function to play audio
    function playSpecialAudio(fileName) {
        const audio = new Audio(`/static/bingo_static/audio/special/${fileName}`);

        audio.play().catch(error => {
            console.error(`Audio file not found: ${fileName}`, error);
        });
    }

    // Function to start the game with predefined numbers
    function startGameWithPredefinedNumbers() {
        gameInterval = setInterval(function () {
            if (resultIndex < resultNumbers.length) {
                const number = resultNumbers[resultIndex];
                audioFunction(number);
                animateNumber(number);
                updateBingoCircleText(number);
                resultIndex++;
            } else {
                clearInterval(gameInterval);
                isGameRunning = false;
                $("#startGame").prop("disabled", false);
                $("#pauseGame").prop("disabled", true);
                $("#resetGame").prop("disabled", false);
                updateBingoCircleText("Game Over!");
            }

        }, gameSpeed);
    }

    function pauseGame(params) {
        if (isGameRunning && !isGamePaused) {
            // Pause the game
            clearInterval(gameInterval);
            isGamePaused = true;
            $("#pauseGame").text("Continue");
        }
    }

    // Method to toggle game pause and continue
    function togglePauseGame() {
        if (isGameRunning && !isGamePaused) {
            // Pause the game
            clearInterval(gameInterval);
            isGamePaused = true;
            $("#pauseGame").text("Continue");
        } else if (isGamePaused) {
            // Continue the game
            isGamePaused = false;
            startGameWithPredefinedNumbers();
            $("#pauseGame").text("Pause");
        }
    }

    // Handle the reset confirmation
    function resetGameConfirmed() {
        currentNumberIndex = 0;
        resultIndex = 0;
        previousCall = 0;

        // Clear interval and disable buttons
        clearInterval(gameInterval);
        isGameRunning = false;
        isGamePaused = false;
        window.clearCartellaSelection();
        // Update UI elements
        updateGameUIAfterReset();
        // Hide the modal
    }

    $("#cancelReset").on("click", function () {
        $("#resetGameModal").modal("hide");
    });

    $("#confirmReset").on("click", function () {
        // Reset game state variables
        resetGameConfirmed();
        $("#resetGameModal").modal("hide");
    });

    // Method to reset the game state
    function resetGame() {
        $("#resetGameModal").modal("show");
    }

    // Method to update the UI after resetting
    function updateGameUIAfterReset() {
        $("#startGame").prop("disabled", true);
        $("#selectCartella").prop("disabled", false); // Enable "Select Cartella"
        $("#pauseGame").prop("disabled", true);
        $("#pauseGame").text("Pause");
        $("#resetGame").prop("disabled", true);
        document.getElementById('totalCalls').textContent = 0;

        // Reset Bingo circle text
        updateBingoCircleText("Let's Play BINGO!");

        // Reset number styles (remove animation and color changes)
        $(".table .number-box").removeClass('active animated')
            .css('color', '')
            .css('background-color', '');
    }

    // Event handlers
    $("#pauseGame").on("click", togglePauseGame);
    $("#resetGame").on("click", resetGame);

    function audioFunction(number) {
        let prefix = '';
        if (number >= 1 && number <= 15) prefix = 'B';
        else if (number >= 16 && number <= 30) prefix = 'I';
        else if (number >= 31 && number <= 45) prefix = 'N';
        else if (number >= 46 && number <= 60) prefix = 'G';
        else if (number >= 61 && number <= 75) prefix = 'O';

        // Play the audio file for the number
        playAudio(`${prefix}_${number}.mp3`);
    }

    // Function to animate the number on the Bingo grid
    function animateNumber(number) {
        setTimeout(() => {
            console.log('Number to be animated is:', number);

            const numberBox = $(".table .number-box").filter(function () {
                return $(this).text() == number;
            });

            numberBox.addClass('active animated')
                .css('color', 'white')
                .css('background-color', 'black');

            setTimeout(function () {
                numberBox.removeClass('animated');
            }, 1000);
        }, 1000);
    }

    // Function to update the bingo circle text, total calls, and previous call
    function updateBingoCircleText(number) {
        let prefix = '';

        // Determine the prefix based on the number range
        if (number >= 1 && number <= 15) prefix = 'B';
        else if (number >= 16 && number <= 30) prefix = 'I';
        else if (number >= 31 && number <= 45) prefix = 'N';
        else if (number >= 46 && number <= 60) prefix = 'G';
        else if (number >= 61 && number <= 75) prefix = 'O';

        // Update the bingo text
        const bingoTextElement = document.getElementById('bingoText');

        // Change the background color based on the prefix
        const bingoCircleInner = document.getElementById('bingoCircleInner');
        // const bingoCircleElement = document.getElementById('bingoCircle');
        let bgColor = '';
        switch (prefix) {
            case 'B':
                bgColor = 'lightblue';
                break;
            case 'I':
                bgColor = 'lightgreen';
                break;
            case 'N':
                bgColor = 'lightyellow';
                break;
            case 'G':
                bgColor = 'lightcoral';
                break;
            case 'O':
                bgColor = 'lightpink';
                break;
        }

        if (Number.isInteger(number)) {

            setTimeout(() => {

                bingoTextElement.textContent = `${prefix}-${number}`;
                bingoCircleInner.style.backgroundColor = bgColor;

                // Update total calls and previous call
                totalCalls++;
                document.getElementById('totalCalls').textContent = totalCalls - 1;
                document.getElementById('previousCall').textContent = previousCall || '0';

                // Update previous call to the current number
                previousCall = `${prefix}-${number}`;
            }, 1000);

        } else {

            bingoTextElement.textContent = `Let's Play BINGO!`;
            bingoCircleInner.style.backgroundColor = 'white';

            document.getElementById('totalCalls').textContent = '0';
            document.getElementById('previousCall').textContent = '0';

        }
    }


    function updateBalance(balance) {
        $("#balance").text(balance);
    }

    // Helper to get CSRF token
    function getCSRFToken() {
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

    function startBingo(cartellas, betAmount) {
        var csrf_token = getCSRFToken();
        console.log('bingo ', cartellas, betAmount, csrf_token);

        $.ajax({
            url: "/start-bingo/",
            method: "POST",
            headers: {
                "X-CSRFToken": csrf_token // Pass CSRF token in the header
            },
            contentType: "application/json", // Send JSON data
            data: JSON.stringify({
                cartellas: cartellas,
                bet_amount: betAmount
            }),
            success: function (response) {
                console.log('server response: ', response);
                if (response.status === "success") {
                    updateBalance(response.new_balance);
                    $("#game-numbers").text(response.result);
                    resultNumbers = response.result;
                    console.log("resultNumbers , ", resultNumbers);
                    $("#start-game-section").addClass("d-none");
                    $("#game-section").removeClass("d-none");
                    transactionId = response.transaction_id;
                } else {
                    console.error("Error message from server:", response.message || "Unable to start the game.");
                    alert(response.message || "Unable to start the game.");
                }
            },
            error: function () {
                alert("An error occurred while starting the game.");
            }
        });
    }

    // Usage inside another method
    function handleStartGameFormSubmit() {
        $("#start-game-form").submit(function (e) {
            e.preventDefault();

        });
    }

    // Start Game Animation with predefined numbers
    $("#startGame").on("click", function () {
        if (!isGameRunning) {
            console.log('selected cartellas in start game:', cartellaState.selected);
            isGameRunning = true;
            $("#startGame").prop("disabled", true);
            $("#pauseGame").prop("disabled", false);
            $("#resetGame").prop("disabled", false);
            $("#selectCartella").prop("disabled", true); // Disable "Select Cartella"
            transactionId = null;

            // send request
            const cartellas = cartellaState.selected;
            const betAmount = cartellaState.betAmount;

            startBingo(cartellas, betAmount); // Call the startBingo method

            // Play start game audio
            playSpecialAudio("start_game.mp3");

            // Start the game after a short delay to allow the start audio to finish
            setTimeout(() => startGameWithPredefinedNumbers(), 2000);
        } else {
            console.log('game is running cant start another game');
        }
    });


    $("#check-winner-btn").click(function () {
        let cartella = $("#checkCartella").val().trim(); // Get the value of the cartella input
        let gamePattern = $("#gamePattern").val(); // Get the selected game pattern
        pauseGame();


        if (!cartella) {
            showModal("Error", "Please enter a valid cartella number.");
            return;
        }

        if (!transactionId) {
            showModal("Error", "Bingo game not found.");
            return;
        }

        if (cartellaState.selected.includes(cartella)) {
            $.ajax({
                url: "/check-bingo-winner/",
                method: "POST",
                data: {
                    cartella: cartella,
                    transaction_id: transactionId,
                    call_number: totalCalls,
                    game_pattern: gamePattern, // Include selected game pattern
                    csrfmiddlewaretoken: $("#check_csrf").val(), // CSRF token
                },
                success: function (response) {
                    if (response.success) {
                        const cartellasList = JSON.parse($(".cartellas_list").text());
                        const selectedCartella = cartellasList[cartella - 1];

                        if (response.is_winner) {
                            showModal(
                                "Congratulations!",
                                `You won $${response.total_won}`,
                                [{ number: cartella, isWinner: true }],
                                selectedCartella,
                                true,
                                gamePattern
                            );
                            $("#endGameBtn").prop("disabled", false); // Enable End Game button
                        } else {
                            showModal(
                                "Result",
                                "Sorry, you did not win.",
                                [{ number: cartella, isWinner: false }],
                                selectedCartella,
                                false,
                                gamePattern
                            );
                        }
                    } else {
                        showModal("Error", response.error || "Error checking winner.");
                    }
                },
                error: function () {
                    showModal("Error", "An error occurred while checking the winner.");
                },
            });
        } else {
            showModal("Error", "Un-known cartella number.");
        }
    });

    // Function to show the modal and render the 5x5 cartella grid
    function showModal(title, message, cartellaResults = [], cartella = [], isWinner = false, gamePattern) {
        $("#bingoResultModalLabel").text(title);
        $("#bingoMessage").text(message);

        // Update cartella results
        const resultContainer = $("#cartellaResult");
        resultContainer.empty();

        if (cartella.length > 0) {
            const activePattern = gamePattern;

            // BINGO ranges for columns
            const bingoRanges = {
                B: { start: 1, end: 15 },
                I: { start: 16, end: 30 },
                N: { start: 31, end: 45 },
                G: { start: 46, end: 60 },
                O: { start: 61, end: 75 }
            };

            // Create arrays for each column based on the bingo range
            let bingoColumns = {
                B: [],
                I: [],
                N: [],
                G: [],
                O: []
            };

            // Distribute numbers into their respective columns
            cartella.forEach(number => {
                if (number >= bingoRanges.B.start && number <= bingoRanges.B.end) {
                    bingoColumns.B.push(number);
                } else if (number >= bingoRanges.I.start && number <= bingoRanges.I.end) {
                    bingoColumns.I.push(number);
                } else if (number == 0 || number >= bingoRanges.N.start && number <= bingoRanges.N.end) {
                    bingoColumns.N.push(number);
                } else if (number >= bingoRanges.G.start && number <= bingoRanges.G.end) {
                    bingoColumns.G.push(number);
                } else if (number >= bingoRanges.O.start && number <= bingoRanges.O.end) {
                    bingoColumns.O.push(number);
                }
            });

            // Render 5x5 grid with correct column arrangement
            const grid = $("<div>").addClass("check-cartella-grid");

            for (let i = 0; i < 5; i++) {
                ["B", "I", "N", "G", "O"].forEach(letter => {
                    const cellValue = bingoColumns[letter][i]; // Get the number for the current row and column
                    const isMatched = resultNumbers.slice(0, resultIndex).includes(cellValue); // Check if this cell is matched based on the result index
                    const cell = $("<div>")
                        .addClass("cartella-cell")
                        .text(cellValue === 0 ? 'Free' : cellValue) // Display "Free" for the free space
                        .toggleClass("matched", isMatched) // Apply 'matched' if the number is in the called results
                        .toggleClass("unmatched", !isMatched); // Apply 'unmatched' if the number is not in the called results
    
                    grid.append(cell);
                });
            }

            resultContainer.append(grid);
        }

        // Show cartella results (e.g., win/loss icons)
        cartellaResults.forEach((result) => {
            const icon = result.isWinner
                ? '<span class="text-success ms-2">&#10003; Won</span>' // Checkmark
                : '<span class="text-danger ms-2">&#10007; Lost</span>'; // Crossmark

            resultContainer.append(
                `<div class="cartella-item d-flex align-items-center mb-2">
                <span>${result.number}</span>${icon}
            </div>`
            );
        });

        // Show modal
        $("#bingoResultModal").modal("show");
    }


    // Event listener for "End Game" button
    $("#endGameBtn").click(function () {
        // Logic to end the game
        $("#bingoResultModal").modal("hide");
        resetGameConfirmed();
        // alert("Game ended. Thanks for playing!");
    });

    // Event listener for "Continue Game" button
    $("#continueGameBtn").click(function () {
        // togglePauseGame(); // Resume the game
        $("#bingoResultModal").modal("hide");
    });

});