const Router = require('koa-router');
const { User } = require('./db');
const fs = require('fs');
const { writeCSV, generateExcel, stylizeUserTable} = require('./utils');
const {Op} = require("sequelize");

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
        const startTime = performance.now();
        const users = await User.findAll();
        const matrix = users.map((u) => ({
            name: u.name,
            last_name: u.last_name,
            hobbies: u.hobbies,
        }));

        const filePath = './users.xlsx';

        await generateExcel(matrix, 'Users', stylizeUserTable, filePath);

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
        await User.destroy({where: {}}); // Delete all users
        ctx.body = {message: 'All users have been deleted successfully.'};
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;