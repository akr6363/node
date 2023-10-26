const Router = require('koa-router');
const { User } = require('./db');
const fs = require('fs');
const { writeCSV } = require('./fileManager');

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

module.exports = router;