const Router = require('koa-router');
const { User } = require('./db');
const fs = require('fs');
const { writeCSV, generateExcel, stylizeUserTable} = require('./utils');
const {Op} = require("sequelize");
const ExcelJS = require("exceljs");
const send = require('koa-send');

const router = new Router();;
router.post('/add-user', async (ctx) => {
    const { name, last_name, hobbies } = ctx.request.body;
    try {
        ctx.body = await User.create({name, last_name, hobbies});
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
    const { query, sortName, sortDir } = ctx.request.query;

    try {
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { last_name: { [Op.like]: `%${query}%` } },
                    { hobbies: { [Op.overlap]: [query] } }
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
        const users = await User.findAll();
        const matrix = users.map((u) => ({
            name: u.name,
            last_name: u.last_name,
            hobbies: u.hobbies,
        }));

        const buffer = await generateExcel(matrix, 'Users', stylizeUserTable);

        ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        ctx.set('Content-Disposition', 'attachment; filename=users.xlsx');

        ctx.body = buffer;
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = 'Server Error';
    }
});

module.exports = router;