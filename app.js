const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { sequelize } = require('./db');
const router = require('./routes');
const cors = require('koa2-cors');

const app = new Koa();

app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

app.use(cors());
(async () => {
    try {
        await sequelize.authenticate();
        app.listen(8080, () => {
            console.log(`Сервер запущен на порту 8080`);
        });
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err);
    }
})();