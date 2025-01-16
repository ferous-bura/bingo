$(document).ready(function () {

    function startGame() {
        const cartellas = [1, 5, 10]; // Example selected cartellas
        const betAmount = 50; // Example bet amount
        const gameType = 1; // Example game type

        $.ajax({
            url: "/start-game/",  // Your Django view URL
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                cartellas: cartellas,
                bet_amount: betAmount,
                game_type: gameType,
            }),
            headers: { "X-CSRFToken": getCSRFToken() }, // CSRF Token
            success: function (response) {
                if (response.status === "success") {
                    alert(response.message);
                    updateLocalStorage(response);
                    updateUI(response.new_balance);
                } else {
                    alert(response.message);
                }
            },
            error: function (xhr) {
                alert(`Error: ${xhr.responseJSON.message}`);
            },
        });
    }

    // Helper to get CSRF token
    function getCSRFToken() {
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

    // Save transaction details locally
    function updateLocalStorage(response) {
        const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        transactions.push({
            transaction_id: response.transaction_id,
            bet_amount: response.bet_amount,
            cut: response.cut,
        });
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }

    // Update UI
    function updateUI(newBalance) {
        document.getElementById("balance").innerText = `Balance: $${newBalance}`;
    }
});
