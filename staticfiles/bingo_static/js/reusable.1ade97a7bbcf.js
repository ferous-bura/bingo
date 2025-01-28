
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


$(document).ready(function () {
    function playShuffleAudio(fileName) {
        const audio = new Audio(`/static/bingo_static/audio/special/${fileName}`);
        audio.play().catch(error => {
            console.log(`Audio file not found: ${fileName}`, error);
        });
    }

    // Shuffle functionality
    $('#shuffleCartella').on('click', function () {
        const shuffleButton = $(this);

        playShuffleAudio('shuffle.mp3');

        // Add glow effect to the button
        shuffleButton.addClass('glow');

        // Animate numbers
        $('.number-box').each(function () {
            const $numberBox = $(this);

            // Add the 'animated' class to trigger animation
            $numberBox.addClass('shuffled-animated');

            // Add the 'animated-style' class for specific movement and background color
            $numberBox.addClass('shuffled-animated-style');

            // Apply the animation to the number box
            $numberBox.animate(
                {
                    transform: 'translate(25px, 25px)', // Apply the transform directly in animation
                },
                {
                    duration: 15000,
                    step: function (now, fx) {
                        if (fx.prop === 'transform') {
                            $(this).css('transform', now);
                        }
                    },
                    complete: function () {
                        // Remove 'animated' and 'animated-style' classes after the animation is complete
                        $numberBox.removeClass('shuffled-animated shuffled-animated-style');

                        // Optionally, reset any properties or styles if needed
                    },
                }
            );
        });

        // Remove glow effect after 5 seconds
        setTimeout(() => {
            shuffleButton.removeClass('glow');
        }, 10000);
    });
});
