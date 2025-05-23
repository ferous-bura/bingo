
$(document).ready(function () {
    let isChimeMuted = false; // State to track chime toggle

    // Get the 'chime' value from localStorage
    let chime = localStorage.getItem('chime');

    let audioTimeout = null; // Track the setTimeout ID for pending audio
    let numberBoxTimeout = null; // Track the setTimeout ID for pending numberBox
    let currentAudio = null; // Track the currently playing audio
    const currentDate = new Date();
    let gameSpeed = parseInt(localStorage.getItem('gameSpeed'), 10) || 5000; // Default to 3000ms
    let newGameSpeed;
    let gameInterval;
    let animeInterval;
    let lastAnimatedNumber = null;  // Track the last animated number
    let isGameRunning = false;
    let refund = localStorage.getItem('refund') === 'true';
    let storedDate = getDateFromLocalStorage();
    const lockedCartella = [];
    let transactionId = localStorage.getItem('transactionId') || null;
    let audioPlaybackPosition = 0; // Track the playback position of the audio
    let resultIndex = parseInt(localStorage.getItem('resultIndex'), 10) || 0;
    let balance = parseInt(localStorage.getItem('balance'), 10) || 0;
    let resultNumbers = localStorage.getItem('resultNumbers');
    resultNumbers = resultNumbers ? JSON.parse(resultNumbers) : null;
    let isGamePaused = false;
    let voiceChoice = localStorage.getItem('voiceChoice') || 'female'; // Default to female
    let totalCalls = parseInt(localStorage.getItem('totalCalls'), 10) || 0;
    let aniTime = 2000; // Default animation interval time

    let previousCall = parseInt(localStorage.getItem('previousCall'), 10) || 0;
    let gamePattern = localStorage.getItem('gamePattern') || 'default';
    function getDateFromLocalStorage() {
        const storedDate = localStorage.getItem('storedDate');
        return storedDate ? new Date(storedDate) : null; // Convert back to Date object if exists
    }

    // Check if chime is 'on' or 'off'
    if (chime === 'on') {
        isChimeMuted = true; // Chime is muted
    } else {
        isChimeMuted = false; // Chime is not muted
    }
    // Attach a change event listener to update gamePattern dynamically
    $("#gamePattern").on("change", function () {
        if (isGameRunning) {
            // Revert the dropdown to the previously stored value
            const currentPattern = localStorage.getItem('gamePattern') || 'default';
            $(this).val(currentPattern); // Reset dropdown to the current pattern
            // console.log("Cannot change game pattern while the game is running.");
            return; // Exit without changing anything
        }
        // Update the game pattern if the game is not running
        gamePattern = $(this).val() || 'default';
        localStorage.setItem('gamePattern', gamePattern);
        // console.log("Game pattern updated:", gamePattern);
    });

    $("#speedValue").text(gameSpeed / 1000);
    $('#refundGame').addClass("d-none");
    $("#pauseGame").prop("disabled", true);

    $('#logout').on('click', function () {
        localStorage.clear();
    });

    function playAudio(fileName) {
        // Stop any currently playing audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0; // Reset audio to the beginning
        }

        // Play the selected voice
        if (voiceChoice === 'female') {
            currentAudio = new Audio(`/static/bingo_static/audio/amharic/f/${fileName}`);
        } else {
            currentAudio = new Audio(`/static/bingo_static/audio/amharic/m/${fileName}`);
        }
        // currentAudio.playbackRate = 1 + (gameSpeed / 1000); // Adjust playback speed based on game speed
        console.log(`Audio ${voiceChoice}`, currentAudio);

        currentAudio.play().catch(error => {
            console.log(`Audio file not found: ${fileName}`, error);
        });
    }

    // // Function to play audio based on the selected voice
    // function playAudio(fileName) {
    //     // Play the selected voice
    //     if (voiceChoice === 'female') {
    //         const female_audio = new Audio(`/static/bingo_static/audio/amharic/f/${fileName}`);
    //         female_audio.play().catch(error => {
    //             console.log(`Audio file not found: ${fileName}`, error);
    //         });
    //     } else {
    //         const male_audio = new Audio(`/static/bingo_static/audio/amharic/m/${fileName}`);
    //         male_audio.play().catch(error => {
    //             console.log(`Audio file not found: ${fileName}`, error);
    //         });
    //     }
    // }

    // Toggle chime setting
    $('#chimeAudio').on('click', function () {
        const $chimebutton = $(this);
        const $chimeicon = $chimebutton.find('i');

        if ($chimebutton.hasClass('btn-light')) {
            // Turn OFF the chime
            $chimebutton.removeClass('btn-light').addClass('btn-secondary');
            $chimeicon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
            isChimeMuted = true;
            localStorage.setItem('chime', 'on');

        } else {
            // Turn ON the chime
            $chimebutton.removeClass('btn-secondary').addClass('btn-light');
            $chimeicon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
            isChimeMuted = false;
            localStorage.setItem('chime', 'off');
        }
    });

    function audioFunction(number) {
        let prefix = '';
        if (number >= 1 && number <= 15) prefix = 'B';
        else if (number >= 16 && number <= 30) prefix = 'I';
        else if (number >= 31 && number <= 45) prefix = 'N';
        else if (number >= 46 && number <= 60) prefix = 'G';
        else if (number >= 61 && number <= 75) prefix = 'O';

        // Play the audio file for the number
        // playChimeAudio("chime.mp3");
        playAudio(`${prefix}_${number}.mp3`);
        audioTimeout = setTimeout(() => playChimeAudio("chime.mp3"), 2500);
    }

    // // Voice selection handlers
    // $('#maleVoice').on('click', function () {
    //     voiceChoice = 'male'; // Set to male voice
    //     localStorage.setItem('voiceChoice', voiceChoice); // Save choice to localStorage
    //     console.log('voice set to male');
    // });

    // $('#femaleVoice').on('click', function () {
    //     voiceChoice = 'female'; // Set to female voice
    //     localStorage.setItem('voiceChoice', voiceChoice); // Save choice to localStorage
    //     console.log('voice set to female');
    // });

    // // Set initial voice selection visually
    // if (voiceChoice === 'male') {
    //     $('#maleVoice').addClass('selected');
    // } else {
    //     $('#femaleVoice').addClass('selected');
    // }
    $(`#voiceSelect option[value="${voiceChoice}"]`).prop('selected', true).addClass('selected');

    $('#voiceSelect').on('change', function () {
        voiceChoice = $(this).val(); // Get the selected value
        console.log(`Voice set to ${voiceChoice}`);
        localStorage.setItem('voiceChoice', voiceChoice); // Save choice to localStorage

        // Update the visual selection
        $('#voiceSelect option').removeClass('selected');
        $(`#voiceSelect option[value="${voiceChoice}"]`).addClass('selected');
    });

    // Initialize the slider for game speed
    $("#slider").slider({
        min: 3000, // Minimum speed (faster)
        max: 8000, // Maximum speed (slower)
        value: gameSpeed, // Set the slider to saved game speed
        step: 500, // Increment steps
        slide: function (event, ui) {
            gameSpeed = ui.value; // Update game speed
            togglePauseGame();
            $("#speedValue").text(gameSpeed / 1000); // Display updated speed
            localStorage.setItem('gameSpeed', gameSpeed); // Save game speed to localStorage
            togglePauseGame();
            // console.log('Game speed is', gameSpeed);
        },

    });

    // Function to play audio
    function playChimeAudio(fileName) {
        if (isChimeMuted) return; // Skip playback if muted

        const audio = new Audio(`/static/bingo_static/audio/special/${fileName}`);
        // console.log('Audio file found: ${fileName}');

        audio.play().catch(error => {
            console.log(`Audio file not found: ${fileName}`, error);
        });
    }
    // Function to play audio
    function playSpecialAudio(fileName) {
        const audio = new Audio(`/static/bingo_static/audio/special/${fileName}`);
        // console.log('Audio file found: ${fileName}');

        audio.play().catch(error => {
            console.log(`Audio file not found: ${fileName}`, error);
        });
    }

    // Function to show the game-over modal
    function showGameOverModal() {
        $('#gameOverModal').show(); // Show the modal
    }
    // Function to close the game-over modal

    $('#closeModal').on('click', function () {
        $('#gameOverModal').hide(); // Hide the modal
        localStorage.setItem('resultIndex', 0);
        localStorage.setItem('totalCalls', 0);
        localStorage.setItem('transactionId', 0);
        clearInterval(gameInterval);
        isGameRunning = false;
        $("#startGame").prop("disabled", false);
        $("#pauseGame").prop("disabled", true);
        $("#resetGame").prop("disabled", false);
        resetGameConfirmed(); // check by uncommenting these bye
        // console.log('reset called from playGame');

        updateBingoCircleText("Over!");
        // console.log('Modal closed.');
    });

    // function playGame() {
    //     gameInterval = setInterval(function () {
    //         console.log('resultIndex < resultNumbers.length');
    //         console.log('resultNumbers length', resultNumbers.length);
    //         console.log('resultIndex', resultIndex);
    //         console.log('totalCalls', totalCalls);

    //         if (resultIndex < resultNumbers.length) {
    //             const number = resultNumbers[resultIndex];
    //             localStorage.setItem('resultIndex', resultIndex);
    //             audioFunction(number); // Play audio for the current number
    //             animateNumber(number);
    //             updateBingoCircleText(number);
    //             resultIndex++;
    //             totalCalls++;

    //             // Update total calls and previous call
    //             localStorage.setItem('totalCalls', totalCalls);
    //             setTimeout(() => {
    //                 addNumber(number);
    //             }, 1000);
    //         } else {

    //             // Play game-over audio
    //             const gameOverAudio = new Audio(`/static/bingo_static/audio/special/game-over.mp3`);

    //             // const gameOverAudio = new Audio('game-over.mp3'); // Replace with your audio file path
    //             gameOverAudio.play().then(() => {
    //                 console.log('Game-over audio played.');
    //             }).catch((error) => {
    //                 console.error('Error playing game-over audio:', error);
    //             });

    //             showGameOverModal();
    //         }
    //     }, gameSpeed);
    // }

    // // Function to start the game with predefined numbers
    function playGame(called_from = '') {
        if (isGamePaused) {
            return;
        }

        // Clear any existing interval
        if (gameInterval) {
            clearInterval(gameInterval);
        }

        console.log('Current game speed:', gameSpeed);

        // Define the function to process each number
        function processNextNumber() {
            if (resultIndex < resultNumbers.length) {
                const number = resultNumbers[resultIndex];
                localStorage.setItem('resultIndex', resultIndex);

                // Trigger audio, animation, and UI updates
                audioFunction(number);
                animateNumber(number);
                updateBingoCircleText(number);
                console.log('number: ', number);

                resultIndex++;
                totalCalls++;
                localStorage.setItem('totalCalls', totalCalls);
                console.log('result index: ', resultIndex);
                console.log('totalCalls: ', totalCalls);

                // Add the number to the board after 1 second
                setTimeout(() => {
                    console.log('starting to add number: ', number);
                    addNumber(number);
                }, 1000);
            } else {
                // End the game when all numbers are called
                clearInterval(gameInterval);
                isGameRunning = false;
                showCountdown(5, () => {
                    localStorage.setItem('resultIndex', 0);
                    localStorage.setItem('totalCalls', 0);
                    localStorage.setItem('transactionId', 0);
                    $("#startGame").prop("disabled", false);
                    $("#pauseGame").prop("disabled", true);
                    $("#resetGame").prop("disabled", false);
                    resetGameConfirmed();
                    updateBingoCircleText("Over!");
                });
            }
        }

        if (called_from === 'start') {
            // clearNumberHistory();
            processNextNumber();
        }

        // Set up the interval for SUBSEQUENT NUMBERS
        gameInterval = setInterval(processNextNumber, gameSpeed);
    }

    function playGame2() {
        if (isGamePaused) {
            // If the game is paused, do not start a new interval
            return;
        }

        // Clear the previous interval before setting a new one
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        // newGameSpeed = gameSpeed;
        // console.log('new game speed ', newGameSpeed);
        console.log('old game speed ', gameSpeed);

        gameInterval = setInterval(function () {

            if (resultIndex < resultNumbers.length) {
                const number = resultNumbers[resultIndex];
                localStorage.setItem('resultIndex', resultIndex);
                audioFunction(number);
                animateNumber(number);
                updateBingoCircleText(number);
                resultIndex++;
                totalCalls++;

                // Update total calls and previous call
                // if (!closedBefore) {
                //     totalCalls++;
                // }
                localStorage.setItem('totalCalls', totalCalls);
                setTimeout(() => {
                    addNumber(number);
                }, 1000);
            } else {
                clearInterval(gameInterval);
                isGameRunning = false;
                showCountdown(5, function () {
                    localStorage.setItem('resultIndex', 0);
                    localStorage.setItem('totalCalls', 0);
                    localStorage.setItem('transactionId', 0);
                    $("#startGame").prop("disabled", false);
                    $("#pauseGame").prop("disabled", true);
                    $("#resetGame").prop("disabled", false);
                    resetGameConfirmed(); // check by uncommenting these bye
                    // console.log('reset called from playGame');
                    updateBingoCircleText("Over!");
                });
            }

        }, gameSpeed);
    }

    // Function to show the countdown
    function showCountdown(seconds, callback) {
        const countdownElement = $('#countdown');
        const countdownTimerElement = $('#countdownTimer');

        // Show the countdown element
        countdownElement.show();
        countdownTimerElement.text(seconds);

        // Start the countdown
        const countdownInterval = setInterval(function () {
            seconds--;
            countdownTimerElement.text(seconds);

            // When the countdown reaches 0
            if (seconds <= 0) {
                clearInterval(countdownInterval); // Stop the countdown
                countdownElement.hide(); // Hide the countdown element
                callback(); // Execute the callback function
            }
        }, 1000); // Update every second
    }

    // function pauseGame() {
    //     if (isGameRunning && !isGamePaused) {
    //         // Pause the game
    //         clearInterval(gameInterval);
    //         isGamePaused = true;
    //         pauseIconToggle();
    //     }
    // }

    function pauseGame() {
        if (isGameRunning && !isGamePaused) {
            // Pause the game
            isGamePaused = true;
            pauseIconToggle();
            clearInterval(gameInterval);

            // If there was a last animated number, continue its animation
            if (lastAnimatedNumber) {
                console.log('lastAnimatedNumber', lastAnimatedNumber);
                animateNumber(lastAnimatedNumber, true);
            }

            // Pause the currently playing audio
            if (currentAudio) {
                currentAudio.pause();
                audioPlaybackPosition = currentAudio.currentTime; // Store the playback position
            }

            // Clear any pending audio playback
            clearTimeout(audioTimeout);
        }

    }


    // Function to resume the game
    function resumeGame() {
        if (isGamePaused) {
            isGamePaused = false;
            pauseIconToggle(); // Update UI

            // Resume the audio from the paused position
            if (currentAudio) {
                currentAudio.currentTime = audioPlaybackPosition; // Set the playback position
                currentAudio.play().catch(error => {
                    console.log('Error resuming audio:', error);
                });
            }

            playGame(); // Restart the game loop
        }
    }

    // Toggle between pause and play icons
    function pauseIconToggle() {
        var icon = $("#pauseGame").find("i");

        if (icon.hasClass("fa-pause")) {
            icon.removeClass("fa-pause").addClass("fa-play-circle");
        } else {
            icon.removeClass("fa-play-circle").addClass("fa-pause");
        }
    };

    // Method to toggle game pause and continue
    function togglePauseGame() {
        if (isGameRunning && !isGamePaused) {
            pauseGame();
        } else {
            resumeGame()
        }
    }

    // Method to update the UI after resetting
    function updateGameUIAfterReset() {
        $("#startGame").prop("disabled", true);
        $("#selectCartella").prop("disabled", false); // Enable "Select Cartella"
        $("#pauseGame").prop("disabled", true);
        $("#resetGame").prop("disabled", true);
        $('#refundGame').addClass("d-none");
        document.getElementById('totalCalls').textContent = 0;

        // Reset Bingo circle text
        updateBingoCircleText("BINGO!");

        // Reset number styles (remove animation and color changes)
        $(".table .number-box").removeClass('active animated')
            .css('color', '')
            .css('background-color', '');
        // console.log('updateGameUIAfterReset');
    }

    // Handle the reset confirmation
    function resetGameConfirmed(fund = false) {
        clearNumberHistory();

        currentNumberIndex = 0;
        resultIndex = 0;
        totalCalls = 0;
        previousCall = 0;
        transactionId = 0;

        refund = false;
        lockedCartella.length = 0;
        localStorage.setItem('refund', 'false');
        localStorage.setItem('transactionId', 0);
        localStorage.setItem('resultIndex', 0);
        localStorage.setItem('previousCall', 0);
        localStorage.setItem('totalCalls', 0);
        // Clear interval and disable buttons

        isGameRunning = false;
        isGamePaused = false;
        // Update UI elements
        updateGameUIAfterReset();
        if (!fund) {
            // window.clearCartellaSelection();
            // Hide the modal
            closeGame();
        } else {
            $("#startGame").prop("disabled", false);
        }
        $("#pauseGame").prop("disabled", true);
        var icon = $("#pauseGame").find("i");
        if (icon.hasClass("fa-play-circle")) {
            icon.removeClass("fa-play-circle").addClass("fa-pause");
        }
        $("#resetGame").prop("disabled", true);
        // console.log('reset is done ');
        $('#checkCartella').attr('placeholder', 'Enter Cartella Number');
        clearInterval(gameInterval);
        clearInterval(animeInterval);
        const numberBox = $(".table .number-box");
        numberBox.css('color', 'black').css('background-color', 'white').css('animation-duration', ``);  // Set rotate duration dynamically
        numberBox.removeClass('animated active');
        clearTimeout(numberBoxTimeout);

    }

    function closeGame() {
        makeGetRequest(
            "/close-bingo/",
            function (response) {
                console.log('Game state data:', response.data);
                // Process the response data as needed
            },
            function (errorMessage) {
                console.log('close game error:', errorMessage);
                // alert(errorMessage || "Unable to fetch game state.");
            }
        );
    }

    function responseStartAction(response) {
        balance = response.new_balance;
        resultNumbers = response.result;
        transactionId = response.transaction_id;

        localStorage.setItem('balance', balance);
        localStorage.setItem('resultNumbers', JSON.stringify(resultNumbers));
        localStorage.setItem('transactionId', transactionId);
        // localStorage.setItem('storedDate', currentDate);
        localStorage.setItem('storedDate', currentDate.toISOString())
        successStart(resultNumbers, transactionId, balance);

        // Play start game audio
        // playSpecialAudio("readyPlay.mp3");

        // Start the game after a short delay to allow the start audio to finish
        // setTimeout(() => playGame(), 1000);
    }

    function refundGame(transaction_id) {
        lockedCartella.length = 0;

        const data = {
            transaction_id: transaction_id
        };

        makePostRequest(
            "/refund-bingo/",
            data,
            function (response) {
                // console.log('refund Server response:', response);
                $('#refundGame').addClass("d-none");
                refund = true;
                localStorage.setItem('refund', refund.toString());
                resetGameConfirmed(true);
                // console.log('reset called from refundGame()');

                responseStartAction(response);
            },
            function (errorMessage) {
                // console.log('error', errorMessage)
                // alert(errorMessage || "Unable to start the game.");
            }
        );
    }

    $("#refundGame").on("click", function () {
        // Reset game state variables
        if (!transactionId) {
            $('#refundGame').addClass("d-none");
            showModalAlert('Game Not Found Please Reset Game !!')
            return;
        }
        refundGame(transactionId);

    });

    $("#cancelReset").on("click", function () {
        $("#resetGameModal").modal("hide");
    });
    $("#resetGame").on("click", function () {
        // Reset game state variables
        resetGameConfirmed();
        // console.log('reset called from confirm reset');

    });

    $("#resetBingo").on("click", function () {
        // Reset game state variables
        resetGameConfirmed();
        // console.log('reset called from confirm reset');

    });

    $("#confirmReset").on("click", function () {
        // Reset game state variables
        resetGameConfirmed();
        // console.log('reset called from confirm reset');

        $("#resetGameModal").modal("hide");
    });

    // Method to reset the game state
    function resetGame() {
        $("#resetGameModal").modal("show");
    }

    // Event handlers
    $("#pauseGame").on("click", togglePauseGame);
    // $("#resetGame").on("click", resetGame);

    // Function to animate the number on the Bingo grid
    // function animateNumber(number) {
    //     setTimeout(() => {
    //         // console.log('Number to be animated is:', number);

    //         const numberBox = $(".table .number-box").filter(function () {
    //             return $(this).text() == number;
    //         });

    //         const rotateDuration = gameSpeed - 500; // Set rotate animation duration based on gameSpeed

    //         // Add 'active' class to trigger animation, then apply colors
    //         numberBox.addClass('active animated')
    //             .css('color', 'white')
    //             .css('background-color', 'black')
    //             .css('animation-duration', `${rotateDuration}ms`);  // Set rotate duration dynamically

    //         // Listen for when the animation ends
    //         numberBox.on('animationend', function () {
    //             // Remove 'animated' and 'active' classes after animation ends
    //             numberBox.removeClass('animated active');
    //         });
    //         lastAnimatedNumber = number;

    //     }, 1000); // Initial delay before animation starts (optional)
    // }

    function animateNumber(number, forever = false) {
        // if (isGamePaused && number === lastAnimatedNumber) {
        //     return;
        // }

        clearInterval(animeInterval);
        // Function to perform the animation
        function performAnimation() {
            numberBoxTimeout = setTimeout(() => {
                // console.log('Number to be animated is:', number);

                const numberBox = $(".table .number-box").filter(function () {
                    return $(this).text() == number;
                });

                const rotateDuration = gameSpeed - 500; // Set rotate animation duration based on gameSpeed

                // Add 'active' class to trigger animation, then apply colors
                numberBox.addClass('active animated')
                    .css('color', 'white')
                    .css('background-color', 'black')
                    .css('animation-duration', `${rotateDuration}ms`);  // Set rotate duration dynamically

                // Listen for when the animation ends
                numberBox.on('animationend', function () {
                    // Remove 'animated' and 'active' classes after animation ends
                    numberBox.removeClass('animated active');
                });

                lastAnimatedNumber = number;

            }, 1000); // Initial delay before animation starts (optional)
        }

        // Perform the animation immediately
        performAnimation();

        // If forever is true, set an interval to repeat the animation
        if (forever) {
            animeInterval = setInterval(performAnimation, aniTime);
        }
    }

    // Function to update the bingo circle text, total calls, and previous call
    function updateBingoCircleText(number, closedBefore = false) {
        let prefix = '';

        // Determine the prefix based on the number range
        if (number >= 1 && number <= 15) prefix = 'B';
        else if (number >= 16 && number <= 30) prefix = 'I';
        else if (number >= 31 && number <= 45) prefix = 'N';
        else if (number >= 46 && number <= 60) prefix = 'G';
        else if (number >= 61 && number <= 75) prefix = 'O';

        // Update the bingo text
        const bingoTextElement = document.getElementById('bingoText');
        const bingoLetterTextElement = document.getElementById('bingoLetterText');

        // Change the background color based on the prefix
        const bingo2ndCircleElement = document.getElementById('bingo-2nd-circle');
        const bingoCircleElement = document.getElementById('bingoCircleInner');
        let bgColor = '';
        let blue = 'radial-gradient(circle at 30% 30%, #ffffff, #4caf50)';
        let green = 'radial-gradient(circle at 30% 30%, #ffffff, #ff9800)';
        let yellow = 'radial-gradient(circle at 30% 30%, #ffffff, #9c27b0)';
        let red = 'radial-gradient(circle at 30% 30%, #ffffff, #2196f3)';
        let magenta = 'radial-gradient(circle at 30% 30%, #ffffff, #f44336)';
        switch (prefix) {
            case 'B':
                bgColor = '#4caf50'; // Strong blue
                break;
            case 'I':
                bgColor = '#ff9800'; // Strong green
                break;
            case 'N':
                bgColor = '#9c27b0'; // Vivid yellow
                break;
            case 'G':
                bgColor = '#2196f3'; // Strong red
                break;
            case 'O':
                bgColor = '#f44336'; // Bright magenta
                break;
        }


        if (Number.isInteger(number)) {

            setTimeout(() => {

                bingoLetterTextElement.textContent = `${prefix}`;
                bingoTextElement.textContent = `${number}`;
                bingoCircleElement.style.borderColor = bgColor;
                bingo2ndCircleElement.style.borderColor = bgColor;

                document.getElementById('totalCalls').textContent = totalCalls - 1;
                document.getElementById('previousCall').textContent = previousCall || '0';

                // Update previous call to the current number
                previousCall = `${prefix}-${number}`;
                localStorage.setItem('previousCall', previousCall);
            }, 1000);

        } else {

            bingoLetterTextElement.textContent = `BINGO!`;
            bingoTextElement.textContent = ``;
            bingoCircleElement.style.backgroundColor = 'white';
            bingo2ndCircleElement.style.backgroundColor = 'white';
            totalCalls = 0;
            resultIndex = 0;

            localStorage.setItem('totalCalls', 0);
            localStorage.setItem('resultIndex', 0);
            localStorage.setItem('previousCall', 0);

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

    function successStart(result, transaction_id, new_balance) {
        updateBalance(new_balance);
        $("#game-numbers").text(result);
        resultNumbers = result;
        $("#start-game-section").addClass("d-none");
        $("#game-section").removeClass("d-none");
        transactionId = transaction_id;
    }

    function startBingo(cartellas, betAmount, betType, gamePattern) {
        $('#refundGame').addClass("d-none");
        clearNumberHistory();
        console.log('starting bingo, betType: ', betType);
        const data = {
            cartellas: cartellas,
            bet_amount: betAmount,
            game_pattern: gamePattern,
            bet_type: betType
        };

        // Conditionally add transaction_id
        // console.log('refund in start', refund);
        if (refund) {
            data.transaction_id = transactionId;
        }
        console.log('refund in start', refund, data);

        makePostRequest(
            "/start-bingo/",
            data,
            function (response) {
                refund = false;

                localStorage.setItem('refund', 'false');
                balance = response.new_balance;
                resultNumbers = response.result;
                transactionId = response.transaction_id;

                localStorage.setItem('totalCalls', totalCalls);
                localStorage.setItem('balance', balance);
                localStorage.setItem('resultNumbers', JSON.stringify(resultNumbers));
                localStorage.setItem('transactionId', transactionId);
                // localStorage.setItem('storedDate', currentDate);
                localStorage.setItem('storedDate', currentDate.toISOString())
                successStart(resultNumbers, transactionId, balance);

                // Play start game audio
                playSpecialAudio("readyPlay.mp3");

                // Start the game after a short delay to allow the start audio to finish
                setTimeout(() => playGame('start'), 4000);
            },
            function (errorMessage) {
                resetGameConfirmed();
                // console.log('reset called from start');
                showModalAlert(errorMessage || "Unable to start the game.");
                // alert(errorMessage || "Unable to start the game.");
            }
        );
    }


    // Usage inside another method
    function handleStartGameFormSubmit() {
        $("#start-game-form").submit(function (e) {
            e.preventDefault();

        });
    }

    // Check if a given date matches the stored date
    function isDateInLocalStorage() {
        return storedDate && storedDate.getDate === currentDate.getDate; // Compare time values
    }



    // console.log('storedDate', storedDate);
    // console.log('currentDate', currentDate);
    if (isDateInLocalStorage()) {
        checkForUnfinishedGame();
        // console.log('storedDate', storedDate.getDate());
        // console.log('currentDate', storedDate.getDate());
    } else {
        localStorage.clear()
        // console.log('not storedDate', storedDate);
        // console.log('not currentDate', currentDate);
    }
    // Assuming `resultNumbers` is an array of numbers
    function animateNumbersSequentially(resultNumbers, resultIndex) {
        let currentIndex = 0;

        function processNumber() {
            if (currentIndex <= resultIndex) {
                const number = resultNumbers[currentIndex];

                // Perform the desired actions
                animateNumber(number);        // Function to animate the number
                updateBingoCircleText(number, true); // Function to update the circle text
                addNumber(number);            // Function to add the number to the board or list

                currentIndex++; // Move to the next number

                // Continue to the next number after the specified delay
                setTimeout(processNumber, 10);
            }
        }

        processNumber(); // Start the process
    }



    function checkForUnfinishedGame() {
        // let transactionId = localStorage.getItem('transactionId') || '0';

        // console.log('result index', resultIndex);
        // console.log('result number', resultNumbers);
        // let resultIndex = localStorage.getItem('resultIndex') || '0';
        if (resultNumbers && resultIndex > 0 && resultIndex < 75) {

            isGameRunning = true;
            $("#pauseGame").prop("disabled", false);
            $("#resetGame").prop("disabled", false);
            $("#selectCartella").prop("disabled", true);
            $("#startGame").prop("disabled", true);
            $('#refundGame').addClass("d-none");

            animateNumbersSequentially(resultNumbers, resultIndex);
            // resultIndex++;

            clearNumberHistory();
            successStart(resultNumbers, transactionId, balance);
            resultIndex++;
            // totalCalls--;
            pauseGame();

        } else {
            console.log('clear everything');
        }

    }

    // Start Game Animation with predefined numbers
    $("#startGame").on("click", function () {
        var cartellaLength = cartellaState.selected.length;
        if (!isGameRunning && cartellaLength > 0) {
            // console.log('selected cartellas in start game:', cartellaState.selected);

            isGameRunning = true;
            lockedCartella.length = 0;
            $("#startGame").prop("disabled", true);
            $("#pauseGame").prop("disabled", false);
            $("#resetGame").prop("disabled", false);
            $("#selectCartella").prop("disabled", true);
            $('#refundGame').addClass("d-none");

            // send request
            const cartellas = cartellaState.selected;
            const betAmount = cartellaState.betAmount;
            const betType = cartellaState.betType;

            currentNumberIndex = 0;
            resultIndex = 0;
            totalCalls = 0;
            previousCall = 0;
            transactionId = 0;

            localStorage.setItem('refund', 'false');
            localStorage.setItem('transactionId', 0);
            localStorage.setItem('resultIndex', 0);
            localStorage.setItem('previousCall', 0);
            localStorage.setItem('totalCalls', 0);
            startBingo(cartellas, betAmount, betType, gamePattern); // Call the startBingo method

        } else {
            console.log('game is running cant start another game');
        }
    });

    function checkWinner() {
        pauseGame();
        let cartella = $("#checkCartella").val().trim();

        if (!cartella) {
            showResultModal("Error", "Please enter a valid cartella number.");
            return;
        }

        if (!transactionId) {
            showResultModal("Error", "Bingo game not found.");
            return;
        }

        if (cartellaState.selected.includes(cartella)) {
            // console.log('checking resultIndex: ', resultIndex);
            // console.log('checking totalCalls : ', totalCalls);
            $.ajax({
                url: "/check-bingo-winner/",
                method: "POST",
                data: {
                    cartella: cartella,
                    transaction_id: transactionId,
                    call_number: resultIndex,
                    game_pattern: gamePattern, // Include selected game pattern
                    csrfmiddlewaretoken: $("#check_csrf").val(), // CSRF token
                },

                success: function (response) {
                    // console.log('response', response);
                    // console.log('error', response.error);
                    if (response.success) {
                        const cartellasList = JSON.parse($(".cartellas_list").text());
                        const selectedCartella = cartellasList[cartella - 1];
                        refund = response.refund;
                        localStorage.setItem('refund', refund.toString());
                        // console.log('refund while checking', refund);

                        // lockedCartella = response.locked_cartella;

                        // const lockbutton = $("#lockCartellaBtn");

                        // // Update the lockedCartella list
                        // if (response.locked) {
                        //     lockbutton.text("Unlock");
                        //     lockbutton.removeClass("btn-secondary").addClass("btn-danger"); // Change style
                        // } else {
                        //     button.text("Lock"); // Change button text to 'Lock'
                        //     button.removeClass("btn-danger").addClass("btn-secondary");
                        // }

                        if (refund) {
                            $('#refundGame').removeClass("d-none");
                        } else {
                            $('#refundGame').addClass("d-none");
                        }

                        if (response.is_winner) {

                            showResultModal(
                                "Congratulations!",
                                ``,
                                [{ number: cartella, isWinner: true }],
                                selectedCartella,
                                true,
                                gamePattern
                            );
                            $("#endGameBtn").prop("disabled", false); // Enable End Game button
                        } else {
                            showResultModal(
                                "Result",
                                "Sorry, you did not win.",
                                [{ number: cartella, isWinner: false }],
                                selectedCartella,
                                false,
                                gamePattern
                            );
                        }
                    } else {
                        showModalAlert(response.error || "Error checking cartella.");
                    }
                },
                error: function (xhr, status, error) {
                    // Include the error message in the modal
                    const errorMessage = xhr.responseText || "An error occurred while checking the winner.";
                    showModalAlert(`${status} - ${errorMessage}`);
                }
            });
        } else {
            showUnknownModalAlert("ካርቴላው አልተመዘገበም", "Un-known Cartella");
            playSpecialAudio("unknown-cartella.mp3");
        }
    }

    // Add a blur event listener to replace the placeholder when clicking away
    $('#checkCartella').on('blur', function () {
        // togglePauseGame();
        // console.log('Input field lost focus!'); // Replace with your action
        $(this).attr('placeholder', 'Enter Cartella Number'); // Reset placeholder
    });

    $('#checkCartella').on('click', function () {
        pauseGame();
        // console.log('Input field clicked!'); // Replace this with your desired action
        $(this).css('border', '2px solid #007bff'); // Add a blue border

        // Example action: Change the placeholder text
        $(this).attr('placeholder', 'Enter Number...');
        // Remove the border after 2 seconds
        setTimeout(() => {
            $(this).css('border', '1px solid #ced4da'); // Reset to default
        }, 2000);
    });

    // Attach click event to the "Check Winner" button
    $("#check-winner-btn").on('click', function () {
        checkWinner();
    });

    // Attach keypress event to the input field
    $("#checkCartella").on('keypress', function (e) {
        if (e.which === 13) { // 13 is the key code for the Enter key
            checkWinner(); // Trigger the checkWinner function
        }
    });

    function showResultModal(title, message, cartellaResults = [], cartella = [], isWinner = false, gamePattern) {
        $("#bingoResultModalLabel").text(title);
        // $("#bingoMessage").text(message);

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

            let cells = [];
            for (let i = 0; i < 5; i++) {
                ["B", "I", "N", "G", "O"].forEach(letter => {
                    const cellValue = bingoColumns[letter][i]; // Get the number for the current row and column
                    const isMatched = resultNumbers.slice(0, resultIndex).includes(cellValue); // Check if this cell is matched based on the result index
                    const cell = $("<div>")
                        .addClass("cartella-cell")
                        .text(cellValue === 0 ? 'Free' : cellValue) // Display "Free" for the free space
                        .toggleClass("matched", isMatched) // Apply 'matched' if the number is in the called results
                        .toggleClass("unmatched", !isMatched && cellValue != 0) // Apply 'unmatched' if the number is not in the called results
                        .toggleClass("freeMatch", cellValue === 0);
                    // .removeClass("unmatched", cellValue === 0); // Add 'freeMatch' class for free space

                    grid.append(cell);
                    cells.push(cell);
                });
            }

            resultContainer.append(grid);
        }

        cartellaResults.forEach((result) => {
            // Show cartella results (e.g., win/loss icons)
            if (result.isWinner) {
                $("#endGameBtn").prop("disabled", false); // Enable End Game button
                setTimeout(() => playSpecialAudio("male_winner.mp3"), 1000);
            } else {
                $("#endGameBtn").prop("disabled", true); // Enable End Game button
                setTimeout(() => playSpecialAudio("male_loser.mp3"), 1000);
            }

            const icon = result.isWinner
                ? '<span class="text-success ms-2"> won <i class="fas fa-thumbs-up fa-2x text-success thumbs"></i></span>' // Checkmark
                : '<span class="text-danger ms-2"> lost <i class="fas fa-thumbs-down fa-2x text-danger thumbs"></i></span>'; // Crossmark

            resultContainer.append(
                `<div class="cartella-item d-flex align-items-center mb-2">
                    <span>${result.number}</span>${icon}
                </div>`
            );

        });

        // Show modal
        $("#bingoResultModal").modal("show");
    }
    function lockCartella() {
        let cartellaNum = $("#checkCartella").val().trim();
        if (cartellaState.selected.includes(cartellaNum)) {

            if (!transactionId) {
                showResultModal("Error", "Bingo game not found.");
                return;
            }
            if (!cartellaNum) {
                showResultModal("Error", "Please enter a valid cartella number.");
                return;
            }

            const data = {
                cartella_num: cartellaNum,
                transaction_id: transactionId,
            };

            // console.log('lock data: ', data);

            makePostRequest(
                "/lock/",
                data,
                function (response) {
                    if (response.success) {
                        const lockbutton = $("#lockCartellaBtn");

                        // Update the lockedCartella list
                        if (response.locked) {
                            // console.log('loced response is succesful ', response);
                            lockedCartella.push(response.cartella); // Add to list
                            lockbutton.text("Unlock"); // Change button text to 'Unlock'
                            lockbutton.removeClass("btn-secondary").addClass("btn-danger"); // Change style
                            showModalAlert("Cartella is Locked");
                        } else {
                            // console.log('response is succesful ', response);
                            const index = lockedCartella.indexOf(response.cartella);
                            if (index > -1) {
                                lockedCartella.splice(index, 1); // Remove from list
                            }
                            lockbutton.text("Lock"); // Change button text to 'Lock'
                            lockbutton.removeClass("btn-danger").addClass("btn-secondary"); // Change style
                            showModalAlert("Cartella is un-Locked");
                        }

                        // console.log("Updated lockedCartella:", lockedCartella);

                    } else {
                        // console.log('response is unsuccesful ', response);

                        showResultModal("Error", response.error || "Error Locking Cartella.");
                    }
                },
                function (errorMessage) {
                    // console.log('error', errorMessage)
                    showResultModal(errorMessage || "Unable to lock the cartella.");
                }
            );
        } else {
            showUnknownModalAlert("ካርቴላው አልተመዘገበም", "Un-known Cartella");
            playSpecialAudio("unknown-cartella.mp3");
        }
    }

    $("#lockCartellaBtn").click(function () {
        lockCartella();
        // $("#bingoResultModal").modal("hide");
    });

    // Event listener for "End Game" button
    $("#endGameBtn").click(function () {
        // Logic to end the game
        $("#bingoResultModal").modal("hide");
        resetGameConfirmed();
        // console.log('reset called from endGameBtn');
        // alert("Game ended. Thanks for playing!");
    });

    // Event listener for "Continue Game" button
    $("#continueGameBtn").click(function () {
        // togglePauseGame(); // Resume the game
        $("#bingoResultModal").modal("hide");
    });


    // initializeAndCheckUnfinishedTransactionId();

    function initializeAndCheckUnfinishedTransactionId() {

        // Update balance, cut percentage, and username
        $('#balance').text(gameData.balance);
        $('#cut-percentage').text(gameData.cut_percentage);
        $('#username').text(gameData.username);

        if (gameData.has_unfinished_game === 'true') {
            // initializeUnfinishedGame(gameData);
            transactionId = gameData.unfinished_transaction_id;
            balance = gameData.game_pattern_list;
            // 
        } else {
            // No unfinished game
            $('#game-options').hide();
            $('#game-section').addClass('d-none');
        }
    }

    function initializeUnfinishedGame(gameData) {
        // console.log('Game Data:', gameData);

        // Handle unfinished game
        $('#game-options').show();
        // console.log('transactionId', transactionId);
        isGameRunning = true;
        isGamePaused = false;
        $("#startGame").prop("disabled", true);
        $("#pauseGame").prop("disabled", true);
        $("#selectCartella").prop("disabled", true);
        // transactionId = null;
        updateBalance(gameData.balance);
        $("#game-numbers").text(gameData.resultNumbers);
        resultNumbers = gameData.resultNumbers;
        // console.log("resultNumbers , ", resultNumbers);
        $("#start-game-section").addClass("d-none");
        $("#game-section").removeClass("d-none");
        cartellaState.betAmount = gameData.bet_amount;
        cartellaState.selected = gameData.submitted_cartella;
        transactionId = gameData.unfinished_transaction_id;
        $('#resumeUnfinishedGame').off('click').on('click', function () {
            resumeGame2(gameData);
        });
        $('#resetGame').off('click').on('click', resetGameConfirmed);
    }

    function resumeGame2(gameData) {
        // console.log('Resuming game with data:', gameData);

        // Populate game section with unfinished game data
        $('#game-section').removeClass('d-none');
        $('#game-numbers').text(gameData.resultNumbers || 'No numbers yet');
        // Other UI updates...
    }

    // function resetGame() {
    //     const csrfToken = getCSRFToken(); // Get CSRF token for POST requests

    //     $.ajax({
    //         url: '/reset-game/', // Adjust the URL path
    //         method: 'POST',
    //         headers: {
    //             'X-CSRFToken': csrfToken,
    //         },
    //         success: function (response) {
    //             if (response.status === 'success') {
    //                 alert(response.message);
    //                 // Reset UI
    //                 $('#game-options').hide();
    //                 $('#game-section').addClass('d-none');
    //             } else {
    //                 console.log('Failed to reset game:', response.message);
    //             }
    //         },
    //         error: function (xhr, status, error) {
    //             console.log('Error resetting game:', error);
    //         },
    //     });
    // }

    $(document).on('keydown', function (event) {
        if (event.code === 'Space') { // Check if the pressed key is the spacebar
            event.preventDefault(); // Prevent default spacebar behavior
            togglePauseGame(); // Toggle pause/resume
        }
    });

});