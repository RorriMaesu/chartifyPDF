$(document).ready(function () {
    $("#uploadBtn").click(function () {
        $("#pdfInput").trigger('click');
    });

    $("#pdfInput").change(function () {
        const file = $(this)[0].files[0];
        analyzePDF(file);
    });
});

function analyzePDF(file) {
    const formData = new FormData();
    formData.append("file", file);

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
            // Try to determine the filename from the content disposition header
            let filename = getFilenameFromHeader(xhr.getResponseHeader('Content-Disposition'));

            // If we couldn't figure out the filename, default to 'analysis.csv'
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

// Show instructions modal
function showInstructions() {
    $("#instructionsModal").css("display", "block");
}

// Close instructions modal
function closeInstructions() {
    $("#instructionsModal").css("display", "none");
}
