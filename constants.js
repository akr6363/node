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

const TABLE_HEADERS = {
    title: 'Наименование',
    register_number: 'Регистрационный номер',
    throughput: 'Пропускная способность',
    owner_department_uuid: 'Организация-владелец',
    source: 'Источник'
}

const SOURCES = {
    mta: 'МТА',
    mta2: 'МТА 2',
    inventarisation_active: 'Инвентаризация',
    children: 'Перевозка детей',
};

module.exports = {
    COLUMN_STYLES,
    TABLE_HEADERS,
    SOURCES
};