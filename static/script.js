$(document).ready(function () {
    preloadSpinnerImages();

    $("#uploadBtn").click(function () {
        $("#pdfInput").trigger('click');
    });

    $("#pdfInput").change(function () {
        const file = $(this)[0].files[0];
        analyzePDF(file);
    });
});

function preloadSpinnerImages() {
    const spinnerImages = [
        "/static/spinner_1.png",
        "/static/spinner_2.png",
        "/static/spinner_3.png",
        "/static/spinner_4.png",
        "/static/spinner_5.png",
        "/static/spinner_6.png",
        "/static/spinner_7.png",
        "/static/spinner_8.png"
    ];

    spinnerImages.forEach(function(imagePath) {
        new Image().src = imagePath;
    });
}

function analyzePDF(file) {
    const formData = new FormData();
    formData.append("file", file);

    // Show the loading spinner animation
    showLoadingSpinner();

    $.ajax({
        type: "POST",
        url: "/upload",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            $("#score").text(response.score);
            $("#textExtract").text(response.total_text);

            // Visualize the text length by page
            visualizeData(response.pages_text_length);

            // Hide the loading spinner 1 second after the file is fully loaded
            setTimeout(function() {
                hideLoadingSpinner();
            }, 1000);
        },
        error: function (error) {
            console.error("Error during the analysis:", error);
        }
    });
}

function visualizeData(data) {
    const trace = {
        type: 'bar',
        x: data.map((_, i) => `Page ${i + 1}`),
        y: data,
        marker: {
            color: 'rgb(0, 128, 128)',
            opacity: 0.7
        }
    };

    const layout = {
        title: 'Text Length by Page',
        xaxis: {
            title: 'Pages',
        },
        yaxis: {
            title: 'Text Length',
        }
    };

    Plotly.newPlot('plot', [trace], layout);
}

function exportData() {
    const score = $("#score").text();
    const text = $("#textExtract").text();

    $.ajax({
        type: "POST",
        url: "/export",
        contentType: "application/json",
        data: JSON.stringify({score: score, total_text: text}),
        success: function (response, status, xhr) {
            let filename = getFilenameFromHeader(xhr.getResponseHeader('Content-Disposition'));
            if (!filename) {
                filename = 'analysis.csv';
            }

            const type = xhr.getResponseHeader('Content-Type');
            const blob = new Blob([response], { type: type });

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        },
        error: function (error) {
            console.error("Error during the data export:", error);
        }
    });
}

function getFilenameFromHeader(header) {
    if (header && header.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(header);
        if (matches !== null && matches[1]) {
            return matches[1].replace(/['"]/g, '');
        }
    }
    return null;
}

function showInstructions() {
    $("#instructionsModal").css("display", "block");
}

function closeInstructions() {
    $("#instructionsModal").css("display", "none");
}

function showLoadingSpinner() {
    $(".loading-container").show();

    const spinnerImages = [
        "/static/spinner_1.png",
        "/static/spinner_2.png",
        "/static/spinner_3.png",
        "/static/spinner_4.png",
        "/static/spinner_5.png",
        "/static/spinner_6.png",
        "/static/spinner_7.png",
        "/static/spinner_8.png"
    ];
    
    let currentImageIndex = 0;
    const spinnerImage = document.querySelector("#loading-spinner");
    spinnerImage.src = spinnerImages[0]; // Set the initial image

    function changeSpinnerImage() {
        currentImageIndex = (currentImageIndex + 1) % spinnerImages.length;
        spinnerImage.src = spinnerImages[currentImageIndex];
    }

    const duration = 45;
    const intervalId = setInterval(changeSpinnerImage, duration);

    // Store the interval ID on the spinner element so it can be cleared later
    spinnerImage.dataset.intervalId = intervalId;
}

function hideLoadingSpinner() {
    // Clear the image cycling interval
    const spinnerImage = document.querySelector("#loading-spinner");
    clearInterval(spinnerImage.dataset.intervalId);

    // Hide the loading container
    $(".loading-container").hide();
}
