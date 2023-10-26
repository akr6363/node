const { createObjectCsvWriter } = require('csv-writer');

function writeCSV(records, filePath) {
    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: Object.keys(records[0]).map((key) => ({
            id: key,
            title: key,
        })),
    });

    return csvWriter.writeRecords(records);
}

module.exports = {
    writeCSV,
};