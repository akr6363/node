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

function generateExcel(data, pageName, stylizeFn, filePath) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(pageName);

    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    data.forEach(row => {
        const values = headers.map(header => JSON.stringify(row[header]));
        worksheet.addRow(values);
    });

    stylizeFn(worksheet)

    return workbook.xlsx.writeFile(filePath);
}

function stylizeUserTable (table) {
    table.getColumn(1).eachCell((cell) => cell.style = COLUMN_STYLES.blue);
    table.getColumn(2).eachCell((cell) => cell.style = COLUMN_STYLES.red);
    table.getColumn(3).eachCell((cell) => cell.style = COLUMN_STYLES.red);
    table.columns.forEach(column => {
        const columnLength = column.values.reduce((acc, value) => {
            return Math.max(acc, value.length);
        }, 0);
        column.width = columnLength < 12 ? 12 : columnLength;
    });
}

module.exports = {
    writeCSV,
    generateExcel,
    stylizeUserTable
};