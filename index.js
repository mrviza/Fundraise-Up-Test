// импортируем библиотеки
const Koa = require("koa");
const mongoose = require("mongoose");
const koaBody = require("koa-body");
const serve = require("koa-static");
const mount = require("koa-mount");
const router = require("koa-router")();

// подключаем переменные окружения
require("dotenv").config();

// создаем экземпляр Коа
const app = new Koa();

// добавляем валидацию к серверу
require("koa-validate")(app);

// добавляем путь с мидлварью парсера тела запроса
router.post("/donate", koaBody(), async (ctx) => {
  // валидация параметров
  ctx
    .checkBody("currency")
    .isAlpha("Currency must be provided")
    .len(3, 3, "Incorrect value");

  ctx
    .checkBody("amount")
    .isNumeric("Amount must be provided")
    .gt(0, "Incorrect value");

  if (ctx.errors) {
    ctx.throw(422, JSON.stringify(ctx.errors));
    return;
  }

  // если ошибок нет, пробуем записать в базу
  const data = ctx.request.body;
  isSucces = await addData(data);

  ctx.body = { ok: isSucces };
});

// подключаем мидлварь роутера к серверу
app.use(router.routes()).use(router.allowedMethods());

// подключаем статику
app.use(mount("/", serve("./dist")));
app.use(mount("/css", serve("./dist/css")));
app.use(mount("/js", serve("./dist/js")));

// Инициализируем соединение с БД, в случае успеха запускаем сервер
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const serverHost = process.env.HOST;
const serverPort = process.env.PORT;

mongoose
  .connect(`mongodb://${dbHost}:${dbPort}/${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(serverPort, serverHost);
    console.log(`Server started at ${serverHost}:${serverPort}`);
  })
  .catch((e) => {
    throw new Error(e);
  });

// Создаем модель для коллекции
const Fund = mongoose.model("fund", {
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
});

/**
 * Функция записи данных пожертвования в базу
 * @param { Object } data
 * @param { number } data.amount
 * @param { string } data.currency
 */
async function addData(data) {
  const amount = data.amount;
  const currency = data.currency;
  const fund = new Fund({ amount, currency });

  let status = false;

  try {
    res = await fund.save();
    status = true;
  } catch (error) {
    console.warn(error);
    status = false;
  }

  return status;
}
