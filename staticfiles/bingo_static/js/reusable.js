
// $(document).ready(function () {
    // Helper to get CSRF token from cookies
function getCSRFToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(name + '=')) {
            return trimmed.substring(name.length + 1);
        }
    }
    return '';
}

// Reusable GET method
function makeGetRequest(url, successCallback, errorCallback = null) {
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status === "success") {
                // console.log('response success', response);
                successCallback(response);
            } else {
                // console.log("Error message from server:", response.message || "Request failed.");
                if (errorCallback) errorCallback(response.message || "Request failed.");
            }
        },
        error: function (xhr, status, error) {
            // console.log("An error occurred:", error);
            if (errorCallback) errorCallback(error);
        }
    });
}

// Reusable POST method
function makePostRequest(url, data, successCallback, errorCallback = null) {
    const csrf_token = getCSRFToken();
    $.ajax({
        url: url,
        method: "POST",
        headers: {
            "X-CSRFToken": csrf_token // Include CSRF token
        },
        contentType: "application/json", // Send JSON data
        data: JSON.stringify(data),
        success: function (response) {
            if (response.status === "success") {
                successCallback(response);
            } else {
                // console.log("Error message from server:", response.message || "Request failed.");
                if (errorCallback) errorCallback(response.message || "Request failed.");
            }
        },
        error: function (xhr, status, error) {
            // console.log("An error occurred:", error);
            if (errorCallback) errorCallback(error);
        }
    });
}

// });
