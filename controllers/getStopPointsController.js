const {getStopPoints, getEntityNames} = require("../api");
const {SOURCES} = require("../constants");
const {generateExcel, stylizeStopPointsTable} = require("../utils");

async function getStopPointsReport(order, filters, limit, filePath) {
    try {
        const totalCount = await createTable(order, filters, limit, filePath, 1)

        if (totalCount > limit) {
            const totalPages = Math.ceil(totalCount / limit)
            for (let page = 2; page <= totalPages; page++) {
                await createTable(order, filters, limit, filePath, page)
            }
        }
        await stylizeStopPointsTable(filePath)
    }
    catch (e) {
        throw e
    }
}

async function createTable(order, filters, limit,filePath, page ) {
    try {
        const meta = {
            filters,
            order,
            pagination: {
                page,
                limit
            }
        }

        const stopPoints = await getStopPoints(meta, {})

        const units = stopPoints.payload.items.map(({owner_department_uuid}) => owner_department_uuid).filter((item, index, arr) => arr.indexOf(item) === index);

        const owners = await getEntityNames({}, {
            full: false,
            items: units.map(uuid => ({
                class: 'App\\Model\\Unit',
                uuid: uuid,
                source: 'organizational_units',
            }))
        })

        const matrix = stopPoints.payload.items.map((item) => (
            {
                ...item,
                owner_department_uuid: item.owner_department_uuid ? owners.payload.items.find(i => i.uuid === item.owner_department_uuid).name : '-не задано-',
                source: SOURCES[item.source]
            }
        ))
        const headers = ['title', 'register_number', 'throughput', 'owner_department_uuid', 'source',];

        await generateExcel(matrix, 'stop points', filePath, headers, page === 1);
        if(page === 1) return stopPoints.headers.meta.pagination.total
    }
    catch (e) {
        throw e
    }
}
module.exports = {
    getStopPointsReport
};
