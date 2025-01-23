
// audioManager.js
export function playAudio(fileName) {
    const audio = new Audio(`/static/bingo_static/audio/amharic/female/${fileName}`);
    audio.play().catch(error => {
        console.warn(`Failed to play audio: ${fileName}`, error);
    });
}

export function playSpecialAudio(fileName) {
    const specialAudio = new Audio(`/static/bingo_static/audio/special/${fileName}`);
    specialAudio.play().catch(error => {
        console.warn(`Failed to play special audio: ${fileName}`, error);
    });
}
// import { playSpecialAudio } from './audioManager.js';

export function handleWinLossAudio(isWinner) {
    const audioFile = isWinner ? "winner.mp3" : "loser.mp3";
    setTimeout(() => playSpecialAudio(audioFile), 1000);
}
