// audio.js
export function playAudio(number) {
    let prefix = '';
    if (number >= 1 && number <= 15) prefix = 'B';
    else if (number >= 16 && number <= 30) prefix = 'I';
    else if (number >= 31 && number <= 45) prefix = 'N';
    else if (number >= 46 && number <= 60) prefix = 'G';
    else if (number >= 61 && number <= 75) prefix = 'O';

    const audio = new Audio(`/static/bingo_static/audio/amharic/${voiceChoice}/${prefix}_${number}.mp3`);
    audio.play().catch(error => {
        console.log(`Audio file not found: ${prefix}_${number}.mp3`, error);
    });
}

export function playSpecialAudio(fileName) {
    const audio = new Audio(`/static/bingo_static/audio/special/${fileName}`);
    audio.play().catch(error => {
        console.log(`Audio file not found: ${fileName}`, error);
    });
}