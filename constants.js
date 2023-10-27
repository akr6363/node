const COLUMN_STYLES = {
    blue: {
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb:  'FF7ED7D1'},
        },
    },
    red: {
        border: {
            top: { style: 'thin', color: { argb: 'FFFF0000' } },
            left: { style: 'thin', color: { argb: 'FFFF0000' } },
            bottom: { style: 'thin', color: { argb: 'FFFF0000' } },
            right: { style: 'thin', color: { argb: 'FFFF0000' } },
        },
    }
}

module.exports = {
    COLUMN_STYLES,
};