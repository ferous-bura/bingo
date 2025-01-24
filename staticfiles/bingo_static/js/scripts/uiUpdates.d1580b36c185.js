import { handleWinLossAudio } from './audioManager.js';

// uiUpdates.js
export function updateBingoCircleText(number) {
    let prefix = '';

    if (number >= 1 && number <= 15) prefix = 'B';
    else if (number >= 16 && number <= 30) prefix = 'I';
    else if (number >= 31 && number <= 45) prefix = 'N';
    else if (number >= 46 && number <= 60) prefix = 'G';
    else if (number >= 61 && number <= 75) prefix = 'O';

    const bingoTextElement = document.getElementById('bingoText');
    const bingoCircleElement = document.getElementById('bingoCircleInner');
    const bingo2ndCircleElement = document.getElementById('bingo-2nd-circle');

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
            bingoTextElement.textContent = `${prefix}-${number}`;
            bingoCircleElement.style.borderColor = bgColor;
            bingo2ndCircleElement.style.borderColor = bgColor;
        }, 1000);
    } else {
        bingoTextElement.textContent = `BINGO!`;
        bingoCircleElement.style.backgroundColor = 'white';
        bingo2ndCircleElement.style.backgroundColor = 'white';
    }
}

export function updateGameUIAfterReset() {
    document.getElementById('totalCalls').textContent = 0;
    const bingoCircleText = document.getElementById('bingoText');
    bingoCircleText.textContent = 'BINGO!';
}

export function setModalTitleAndMessage(title, message) {
    $("#bingoResultModalLabel").text(title);
    $("#bingoMessage").text(message);
}

export function clearResultContainer() {
    const resultContainer = $("#cartellaResult");
    resultContainer.empty();
    return resultContainer;
}

export function renderGrid(cartella, gamePattern, resultNumbers, resultIndex) {
    const bingoRanges = {
        B: { start: 1, end: 15 },
        I: { start: 16, end: 30 },
        N: { start: 31, end: 45 },
        G: { start: 46, end: 60 },
        O: { start: 61, end: 75 },
    };

    const bingoColumns = { B: [], I: [], N: [], G: [], O: [] };

    cartella.forEach(number => {
        if (number >= bingoRanges.B.start && number <= bingoRanges.B.end) {
            bingoColumns.B.push(number);
        } else if (number >= bingoRanges.I.start && number <= bingoRanges.I.end) {
            bingoColumns.I.push(number);
        } else if (number == 0 || (number >= bingoRanges.N.start && number <= bingoRanges.N.end)) {
            bingoColumns.N.push(number);
        } else if (number >= bingoRanges.G.start && number <= bingoRanges.G.end) {
            bingoColumns.G.push(number);
        } else if (number >= bingoRanges.O.start && number <= bingoRanges.O.end) {
            bingoColumns.O.push(number);
        }
    });

    const grid = $("<div>").addClass("check-cartella-grid");
    for (let i = 0; i < 5; i++) {
        ["B", "I", "N", "G", "O"].forEach(letter => {
            const cellValue = bingoColumns[letter][i];
            const isMatched = resultNumbers.slice(0, resultIndex).includes(cellValue);
            const cell = $("<div>")
                .addClass("cartella-cell")
                .text(cellValue === 0 ? 'Free' : cellValue)
                .toggleClass("matched", isMatched)
                .toggleClass("unmatched", !isMatched);

            grid.append(cell);
        });
    }

    return grid;
}

export function updateResultIcons(resultContainer, cartellaResults) {
    cartellaResults.forEach(result => {
        const icon = result.isWinner
            ? '<span class="text-success ms-2">&#10003; Won👍!</span>'
            : '<span class="text-danger ms-2">&#10007; Lost👎!</span>';

        resultContainer.append(`
            <div class="cartella-item d-flex align-items-center mb-2">
                <span>${result.number}</span>${icon}
            </div>
        `);
    });
}

export function showResultModal(title, message, cartellaResults = [], cartella = [], isWinner = false, gamePattern) {
    setModalTitleAndMessage(title, message);
    const resultContainer = clearResultContainer();

    if (cartella.length > 0) {
        const grid = renderGrid(cartella, gamePattern, resultNumbers, resultIndex);
        resultContainer.append(grid);
    }

    updateResultIcons(resultContainer, cartellaResults);
    handleWinLossAudio(isWinner);

    $("#bingoResultModal").modal("show");
}
