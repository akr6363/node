require("dotenv").config()
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const {Sequelize, DataTypes} = require('sequelize')
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    storage: './database.sqlite',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    }
})

sequelize
    .sync()
    .then(()=> {
    console.log('Database connected')
    })
    .catch((err)=> {
        console.log(err)
    })

const user = sequelize.define('user', {
    name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    hobbies: DataTypes.ARRAY(DataTypes.STRING),
})

router.post('/add-user', async (ctx) => {
    const {name, last_name, hobbies} = ctx.request.body;
    try {
        const newUser = await user.create({name, last_name, hobbies})
        ctx.body = newUser
    }
    catch (e) {
         console.log(e)
    }
})

router.get('/get-users-cvs', async (ctx) => {
    try {
        const users = await user.findAll()
        const matrix = users.map(u => ({
            name: u.name,
            last_name: u.last_name,
            hobbies: u.hobbies
        }))

        const csvWriter = createObjectCsvWriter({
            path: 'file.csv',
            header: Object.keys(matrix[0]).map((key) => ({ id: key, title: key })),
        });

        await csvWriter.writeRecords(matrix);

        ctx.attachment('file.csv');
        ctx.type = 'csv';
        ctx.body = fs.createReadStream('file.csv');
    }
    catch (e) {
        ctx.throw(500, 'Произошла ошибка при записи файла CSV');
    }
})

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});