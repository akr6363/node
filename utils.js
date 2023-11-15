const {createObjectCsvWriter} = require('csv-writer');
const ExcelJS = require("exceljs");
const {COLUMN_STYLES, TABLE_HEADERS} = require("./constants");

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

async function generateExcel(data, pageName, filePath, headers, isFirstPage) {
    try {
        const workbook = new ExcelJS.Workbook();
        let worksheet
        if (isFirstPage) {
            worksheet = workbook.addWorksheet(pageName);
            worksheet.addRow(headers.map(h => TABLE_HEADERS[h] ? TABLE_HEADERS[h] : h));
        } else {
            await workbook.xlsx.readFile(filePath);
            worksheet = workbook.getWorksheet(pageName);
        }

        data.forEach(row => {
            const values = headers.map(header =>row[header]);
            worksheet.addRow(values);
        });

        await workbook.xlsx.writeFile(filePath);
    }
catch (e) {
    throw e
}
}

function stylizeUserTable(table) {
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

async function stylizeStopPointsTable(filePath) {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const table = workbook.getWorksheet('stop points');
        const columnWidth = [34, 33, 21, 35, 14];

        const headerStyle = {
            font: {bold: true, size: 10},
            alignment: {horizontal: 'center'},
        };

        columnWidth.forEach((width, index) => {
            table.getColumn(index + 1).width = width;
        });

        const headerRow = table.getRow(1)

        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });
        const rowCount = table.rowCount
       // table.getRow(1).height =  19
        for (let i = 2; i <= rowCount; i++) {
            // table.getRow(i).height =  35
            table.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: {style: 'medium'},
                    left: {style: 'medium'},
                    bottom: {style: 'medium'},
                    right: {style: 'medium'}
                };
                cell.font = {
                    size: 10,
                };
                cell.alignment = {
                    wrapText: true,
                };
            })
        }
        await workbook.xlsx.writeFile(filePath);
    }

    catch (e) {
        throw e
    }
}


module.exports = {
    writeCSV,
    generateExcel,
    stylizeUserTable,
    stylizeStopPointsTable
};