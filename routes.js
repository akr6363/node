const Router = require('koa-router');
const {User} = require('./db');
const fs = require('fs');
const {writeCSV, generateExcel, stylizeUserTable, stylizeStopPointsTable} = require('./utils');
const {Op} = require("sequelize");
const fetch = require('isomorphic-fetch');
const {SOURCES} = require("./constants");
const {getStopPoints, getEntityNames} = require("./api");
const {controller, getStopPointsReport} = require("./controllers/getStopPointsController");

const router = new Router();

router.post('/add-user', async (ctx) => {
    const {name, last_name, hobbies} = ctx.request.body;
    try {
        ctx.body = await User.create({name, last_name, hobbies});
    } catch (e) {
        console.log(e);
    }
});

router.post('/users', async (ctx) => {
    try {
        ctx.body = await User.findAll();
    } catch (e) {
        console.log(e);
    }
});

router.get('/get-users-cvs', async (ctx) => {
    try {
        const users = await User.findAll();
        const matrix = users.map((u) => ({
            name: u.name,
            last_name: u.last_name,
            hobbies: u.hobbies,
        }));
        await writeCSV(matrix, 'file.csv');

        ctx.attachment('file.csv');
        ctx.type = 'csv';
        ctx.body = fs.createReadStream('file.csv');
    } catch (e) {
        ctx.throw(500, 'Произошла ошибка при записи файла CSV');
    }
});

router.get('/search-users', async (ctx) => {
    const {query, sortName, sortDir} = ctx.request.query;

    try {
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    {name: {[Op.like]: `%${query}%`}},
                    {last_name: {[Op.like]: `%${query}%`}},
                    {hobbies: {[Op.overlap]: [query]}}
                ]
            },
            order: [
                [sortName || 'name', sortDir || 'ASC'],
            ]
        });

        ctx.body = users;
    } catch (e) {
        console.log(e);
    }
});

router.get('/generate-excel', async (ctx) => {
    try {
        const startTime = performance.now();
        const users = await User.findAll();
        const matrix = users.map((u) => ({
            name: u.name,
            last_name: u.last_name,
            hobbies: u.hobbies,
        }));

        const headers = Object.keys(matrix[0]);

        const filePath = './users.xlsx';

        await generateExcel(matrix, 'Users', stylizeUserTable, filePath, headers, true);

        ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        ctx.set('Content-Disposition', 'attachment; filename=users.xlsx');


        ctx.attachment('users.xlsx');
        ctx.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        ctx.body = fs.createReadStream(filePath);

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        console.log(`Время выполнения запроса: ${executionTime} мс`);
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = 'Server Error';
    }
});

router.post('/add-many-users', async (ctx) => {
    const {count} = ctx.request.query;

    const hobbiesList = ['programming', 'reading', 'writing', 'singing', 'dancing', 'cooking', 'playing sports'];
    const userData = [];

    for (let i = 0; i < count; i++) {
        userData.push({
            name: `User-${i}`,
            last_name: `Lastname-${i}`,
            hobbies: [hobbiesList[Math.floor(Math.random() * hobbiesList.length)]]
        });
    }

    try {
        await User.bulkCreate(userData);
        ctx.body = {message: `${count} users have been added successfully.`}
    } catch (e) {
        console.log(e);
    }
});

router.delete('/delete-all-users', async (ctx) => {
    try {
        await User.destroy({where: {}});
        ctx.body = {message: 'All users have been deleted successfully.'};
    } catch (e) {
        console.log(e);
    }
});

router.post('/get-stop-points', async (ctx) => {
        const {order, filters, limit} = ctx.request.body;
        const filePath = './stop-points.xlsx'
    const startTime = performance.now();
        try {
            await getStopPointsReport(order, filters, limit, filePath)

            ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            ctx.set('Content-Disposition', 'attachment; filename=users.xlsx');

            ctx.attachment(filePath);
            ctx.body = fs.createReadStream(filePath);
            const endTime = performance.now();
            const executionTime = endTime - startTime;

            console.log(`Время выполнения запроса: ${executionTime} мс`);
        } catch (e) {
            console.log(e);
            ctx.status = 500;
            ctx.body = { error: 'An error occurred while generating the stop points report.' };
        }
    }
)

module.exports = router;
