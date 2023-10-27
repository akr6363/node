const Router = require('koa-router');
const { User } = require('./db');
const fs = require('fs');
const { writeCSV } = require('./fileManager');
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

        await writeCSV(users, 'file.csv');

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

module.exports = router;