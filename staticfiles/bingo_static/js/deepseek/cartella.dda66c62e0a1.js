// cartella.js
export const cartellaState = {
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
            this.saveSelected();
        }
    },
    removeFromSelected(item) {
        const index = this.selected.indexOf(item);
        if (index > -1) {
            this.selected.splice(index, 1);
            this.saveSelected();
        }
    },
    clearSelected() {
        this.selected = [];
        this.saveSelected();
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

export function updateUI(cartellaState) {
    $('#totalPayable').text(`${cartellaState.totalPayable.toFixed(2)} Birr`);
    $('#totalSelectable').text(`${cartellaState.selected.length}`);
    $('#navCartellaCount').text(`Total ${cartellaState.selected.length}` || 'Total 0');
    $('#navTotalPayable').text(`${cartellaState.totalPayable.toFixed(2)} Birr`);

    if (cartellaState.selected.length > 0) {
        $('#startGame').prop('disabled', false);
    } else {
        $('#startGame').prop('disabled', true);
        $("#pauseGame").prop("disabled", true);
        $("#resetGame").prop("disabled", true);
    }
}