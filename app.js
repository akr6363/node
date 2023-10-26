const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { sequelize } = require('./db');
const router = require('./routes');

const app = new Koa();

app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

const PORT =  3000;

(async () => {
    try {
        await sequelize.authenticate();
        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err);
    }
})();