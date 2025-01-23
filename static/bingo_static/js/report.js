
$(document).ready(function () {
    // Show the modal
    $("#openDBModal").on("click", function () {
        $("#dateSearchModal").show();
    });

    // Hide the modal
    $("#closeReportModal").on("click", function () {
        $("#dateSearchModal").hide();
    });

    // Handle the date search form submission
    $("#dateSearchForm").on("submit", function (e) {
        e.preventDefault();
        const startDate = $("#startDate").val();
        // const endDate = $("#endDate").val();
        fetchReports(startDate);
        // fetchReports(startDate, endDate);
    });

    function fetchReports(startDate = "", endDate = "") {
        $.ajax({
            url: "/reports/",
            method: "GET",
            data: {
                start_date: startDate,
                // end_date: endDate,
            },
            success: function (response) {
                const tableBody = $("#reportsTable tbody");
                tableBody.empty(); // Clear previous data

                // Update header with totals
                const modalHeader = $(".report-header");
                const totalBalance = parseFloat(response.total_balance) || 0;
                const totalTransactions = response.total_transactions || 0;
                const totalWinning = parseFloat(response.total_winning) || 0;
                const totalCut = parseFloat(response.total_cut) || 0;

                // Update left, middle, and right sections
                modalHeader.find(".report-left").html(`
                    <div class="report-item">
                        <span>Game Transactions:</span>
                        <strong>${totalTransactions}</strong>
                    </div>
                `);

                modalHeader.find(".report-middle h3").html(`
                    <div class="report-item" style="color: red; font-size: 1.4rem">
                        <span>Balance:</span>
                        <strong>${totalBalance.toFixed(2)} Birr</strong>
                    </div>
                `);

                modalHeader.find(".report-right").html(`
                    <div class="report-item" style="color: white;">
                        <span>Winning:</span>
                        <strong>${totalWinning.toFixed(2)}</strong>
                    </div>
                    <div class="report-item" style="color: white;>
                        <span>Cut:</span>
                        <strong>${totalCut.toFixed(2)}</strong>
                    </div>
                `);
                if (response.data.length === 0) {
                    tableBody.append("<tr><td colspan='12'>No data available</td></tr>");
                } else {
                    response.data.forEach((row) => {
                        tableBody.append(`
                      <tr>
                          <td>${row.date}</td>
                          <td>${row.time}</td>
                          <td>${row.bet}</td>
                          <td>${row.player_number}</td>
                          <td>${row.total_won}</td>
                          <td>${row.cut}</td>
                          <td>${row.won}</td>
                          <td>${row.call_number}</td>
                          <td>${row.winners}</td>
                          <td>${row.branch}</td>
                          <td>${row.cashier}</td>
                      </tr>
                  `);
                    });
                }
            },
            error: function () {
                showModalAlert("Failed to fetch reports. Please try again.");
            },
        });
    }
});