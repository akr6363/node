const { createObjectCsvWriter } = require('csv-writer');
const ExcelJS = require("exceljs");
const {COLUMN_STYLES} = require("./constants");

function writeCSV(data, filePath) {

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: Object.keys(data[0]).map((key) => ({
            id: key,
            title: key,
        })),
    });

    return csvWriter.writeRecords(data);
}

function generateExcel(data, pageName, stylizeFn) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(pageName);

    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    data.forEach(row => {
        const values = headers.map(header => row[header]);
        worksheet.addRow(values);
    });

    stylizeFn(worksheet)

    return workbook.xlsx.writeBuffer();
}

function stylizeUserTable (table) {
    table.getColumn(1).eachCell((cell) => cell.style = COLUMN_STYLES.blue);
    table.getColumn(2).eachCell((cell) => cell.style = COLUMN_STYLES.red);
    table.getColumn(3).eachCell((cell) => cell.style = COLUMN_STYLES.red);
}

module.exports = {
    writeCSV,
    generateExcel,
    stylizeUserTable
};