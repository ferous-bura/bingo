
$(document).ready(function () {
    // Define the audio files to check
    let filesChecked = false; // Flag to track if files have been checked
    const audioFiles = [
        "B_1.mp3", "B_2.mp3", "B_3.mp3", "B_4.mp3", "B_5.mp3", "B_6.mp3", "B_7.mp3", "B_8.mp3", "B_9.mp3", "B_10.mp3",
        "B_11.mp3", "B_12.mp3", "B_13.mp3", "B_14.mp3", "B_15.mp3", "I_16.mp3", "I_17.mp3", "I_18.mp3", "I_19.mp3", "I_20.mp3",
        "I_21.mp3", "I_22.mp3", "I_23.mp3", "I_24.mp3", "I_25.mp3", "I_26.mp3", "I_27.mp3", "I_28.mp3", "I_29.mp3", "I_30.mp3",
        "N_31.mp3", "N_32.mp3", "N_33.mp3", "N_34.mp3", "N_35.mp3", "N_36.mp3", "N_37.mp3", "N_38.mp3", "N_39.mp3", "N_40.mp3",
        "N_41.mp3", "N_42.mp3", "N_43.mp3", "N_44.mp3", "N_45.mp3", "G_46.mp3", "G_47.mp3", "G_48.mp3", "G_49.mp3", "G_50.mp3",
        "G_51.mp3", "G_52.mp3", "G_53.mp3", "G_54.mp3", "G_55.mp3", "G_56.mp3", "G_57.mp3", "G_58.mp3", "G_59.mp3", "G_60.mp3",
        "O_61.mp3", "O_62.mp3", "O_63.mp3", "O_64.mp3", "O_65.mp3", "O_66.mp3", "O_67.mp3", "O_68.mp3", "O_69.mp3", "O_70.mp3",
        "O_71.mp3", "O_72.mp3", "O_73.mp3", "O_74.mp3", "O_75.mp3"
    ];

    // Define the directories to check
    const directories = ["/static/bingo_static/audio/amharic/m/", "/static/bingo_static/audio/amharic/f/"];

    // Function to check if a file exists
    function checkFileExists(url, callback) {
        $.ajax({
            url: url,
            type: 'HEAD',
            success: function () {
                callback(true); // File exists
            },
            error: function () {
                callback(false); // File does not exist
            }
        });
    }

    // Function to download a file
    function downloadFile(url, fileName) {
        $.ajax({
            url: url,
            method: 'GET',
            xhrFields: {
                responseType: 'blob' // Ensure the response is treated as a binary file
            },
            success: function (data) {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(data);
                link.download = fileName;
                link.click();
                console.log(`Downloaded: ${fileName}`);
            },
            error: function (error) {
                console.log(`Failed to download: ${fileName}`, error);
            }
        });
    }

    if (!filesChecked) {
        // Check all files in both directories
        directories.forEach(directory => {
            audioFiles.forEach(file => {
                const fileUrl = directory + file;
                checkFileExists(fileUrl, function (exists) {
                    if (!exists) {
                        console.log(`File not found: ${fileUrl}`);
                        // Download the file if it doesn't exist
                        downloadFile(`https://lotterybingo.pythonanywhere.com/${file}`, file);
                    } else {
                        console.log(`File already exists: ${fileUrl}`);
                    }
                });
            });
        });
        filesChecked = true; // Set the flag to true after checking
    }
});