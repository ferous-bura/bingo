// api.js
export function makeGetRequest(url, successCallback, errorCallback = null) {
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status === "success") {
                successCallback(response);
            } else {
                if (errorCallback) errorCallback(response.message || "Request failed.");
            }
        },
        error: function (xhr, status, error) {
            if (errorCallback) errorCallback(error);
        }
    });
}

export function makePostRequest(url, data, successCallback, errorCallback = null) {
    const csrf_token = getCSRFToken();
    $.ajax({
        url: url,
        method: "POST",
        headers: {
            "X-CSRFToken": csrf_token
        },
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            if (response.status === "success") {
                successCallback(response);
            } else {
                if (errorCallback) errorCallback(response.message || "Request failed.");
            }
        },
        error: function (xhr, status, error) {
            if (errorCallback) errorCallback(error);
        }
    });
}