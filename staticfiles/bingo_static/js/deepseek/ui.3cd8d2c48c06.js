// ui.js
export function animateNumber(number) {
    const numberBox = $(".table .number-box").filter(function () {
        return $(this).text() == number;
    });

    const rotateDuration = gameSpeed - 500;

    numberBox.addClass('active animated')
        .css('color', 'white')
        .css('background-color', 'black')
        .css('animation-duration', `${rotateDuration}ms`);

    numberBox.on('animationend', function () {
        numberBox.removeClass('animated active');
    });
}

export function updateBingoCircleText(number) {
    let prefix = '';
    if (number >= 1 && number <= 15) prefix = 'B';
    else if (number >= 16 && number <= 30) prefix = 'I';
    else if (number >= 31 && number <= 45) prefix = 'N';
    else if (number >= 46 && number <= 60) prefix = 'G';
    else if (number >= 61 && number <= 75) prefix = 'O';

    const bingoTextElement = document.getElementById('bingoText');
    const bingoLetterTextElement = document.getElementById('bingoLetterText');
    const bingo2ndCircleElement = document.getElementById('bingo-2nd-circle');
    const bingoCircleElement = document.getElementById('bingoCircleInner');

    let bgColor = '';
    switch (prefix) {
        case 'B': bgColor = '#4caf50'; break;
        case 'I': bgColor = '#ff9800'; break;
        case 'N': bgColor = '#9c27b0'; break;
        case 'G': bgColor = '#2196f3'; break;
        case 'O': bgColor = '#f44336'; break;
    }

    if (Number.isInteger(number)) {
        setTimeout(() => {
            bingoLetterTextElement.textContent = `${prefix}`;
            bingoTextElement.textContent = `${number}`;
            bingoCircleElement.style.borderColor = bgColor;
            bingo2ndCircleElement.style.borderColor = bgColor;
        }, 1000);
    } else {
        bingoLetterTextElement.textContent = `BINGO!`;
        bingoTextElement.textContent = ``;
        bingoCircleElement.style.backgroundColor = 'white';
        bingo2ndCircleElement.style.backgroundColor = 'white';
    }
}

export function updateGameUIAfterReset() {
    $("#startGame").prop("disabled", true);
    $("#selectCartella").prop("disabled", false);
    $("#pauseGame").prop("disabled", true);
    $("#resetGame").prop("disabled", true);
    $('#refundGame').addClass("d-none");
    document.getElementById('totalCalls').textContent = 0;
    updateBingoCircleText("BINGO!");
    $(".table .number-box").removeClass('active animated')
        .css('color', '')
        .css('background-color', '');
}