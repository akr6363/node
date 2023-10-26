const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { sequelize } = require('./db');
const router = require('./routes');

const app = new Koa();

app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

(async () => {
    try {
        await sequelize.authenticate();
        app.listen(3000, () => {
            console.log(`Сервер запущен на порту 3000`);
        });
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err);
    }
})();