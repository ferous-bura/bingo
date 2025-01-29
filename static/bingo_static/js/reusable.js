
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

        // playShuffleAudio('shuffle.mp3');
        playShuffleAudio('shuffled.mp3');

        // Add glow effect to the button
        shuffleButton.addClass('glow');
        $('.number-box').each(function () {
            const $numberBox = $(this);
        
            // Randomize animation properties
            const translateX = Math.floor(Math.random() * 30) - 15; // Random value between -15 and 15
            const translateY = Math.floor(Math.random() * 30) - 15; // Random value between -15 and 15
            const rotate = Math.floor(Math.random() * 360); // Random rotation between 0 and 360 degrees
            const scale = 1 + Math.random(); // Random scale between 1 and 2
        
            $numberBox.addClass('shuffled-animated shuffled-animated-style');
        
            $numberBox.animate(
                {
                    transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                },
                {
                    duration: 3000,
                    step: function (now, fx) {
                        if (fx.prop === 'transform') {
                            $(this).css('transform', now);
                        }
                    },
                    complete: function () {
                        $numberBox.removeClass('shuffled-animated shuffled-animated-style');
                        $numberBox.css('transform', 'translate(0, 0) rotate(0deg) scale(1)');
                        $numberBox.fadeOut(500, function () {
                            $(this).fadeIn(500);
                        });
                    },
                }
            );
        });
        // Remove glow effect after 5 seconds
        setTimeout(() => {
            shuffleButton.removeClass('glow');
        }, 3000);
    });
});
