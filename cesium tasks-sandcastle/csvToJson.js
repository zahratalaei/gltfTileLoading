function extractAllConsecutiveSamples(url, sampleSize, callback) {
    Papa.parse(url, {
        download: true,
        header: true,  // Assumes the first row of your CSV is a header
        complete: function(results) {
            let data = results.data;

            let allSamples = [];
            for (let i = 0; i < data.length; i += sampleSize) {
                if (i + sampleSize > data.length) {
                    break;  // Ensure there's enough data left to extract the sample
                }
                let sample = data.slice(i, i + sampleSize);
                allSamples.push(sample);
            }

            callback(allSamples);
        }
    });
}
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});  // Format JSON with 2-space indentation
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
document.addEventListener("DOMContentLoaded", function() {
    const CSV_PATH = "hobart_cats.csv";
    extractAllConsecutiveSamples(CSV_PATH, 11, function(samples) {
        downloadJSON(samples, "hobart_extracted_data.json");
    });
});

