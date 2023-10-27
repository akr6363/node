const { createObjectCsvWriter } = require('csv-writer');

function writeCSV(data, filePath) {

    const matrix = data.map((u) => ({
        name: u.name,
        last_name: u.last_name,
        hobbies: u.hobbies,
    }));

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: Object.keys(matrix[0]).map((key) => ({
            id: key,
            title: key,
        })),
    });

    return csvWriter.writeRecords(matrix);
}

module.exports = {
    writeCSV,
};