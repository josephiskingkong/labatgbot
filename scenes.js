const { Telegraf, Scenes, Markup } = require("telegraf");
const bot = new Telegraf("6261984727:AAGhPHUCp-Xe5MefNiyz24DSrWencl3ULR8");
const axios = require("axios");
const { startMessageKeyboard, mainMenuKeyboard } = require("./keyboards");
const schedule = require('node-schedule');
const moment = require("moment-timezone");
const { google } = require("googleapis");

let name, age, interests;

function getRandomPhrase() {
    return randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
  }

async function startMessage(ctx) {
    await ctx.replyWithHTML(`<i>👋Привет,  <b>${ctx.from.first_name}</b>\n🤖Ниже приведены кнопки и клавиатура для демонстрации функционала бота</i>`, {
        reply_markup: {
            inline_keyboard: startMessageKeyboard,
        }
    });
    await ctx.replyWithHTML('<b>⌨️Клавиатура загружена!</b>', mainMenuKeyboard)
}

function ageEnding(age) {
    let ending = "лет";
    if (age % 10 === 1 && age % 100 !== 11) {
      ending = "год";
    } else if (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20)) {
      ending = "года";
    }
    return ending;
  }

const randomPhrases = [
    '<b>😀Рад тебя услышать</b>',
    '<b>👋Привет! Как твой день?</b>',
    '<b>😉Давно не слышались!</b>',
    '<b>😊Отлично звучишь!</b>',
    '<b>👍Ты сегодня в ударе!</b>',
    '<b>🌞Какой прекрасный голос!</b>',
    '<b>😄Приятно тебя слышать!</b>',
    '<b>😎Ты звучишь круто!</b>',
    '<b>🚀Какие у тебя новости?</b>',
    '<b>💬Давай общаться!</b>',
    '<b>😃Ты всегда звучишь великолепно!</b>',
    '<b>🎉С каждым разом звучишь лучше!</b>',
    '<b>🤗Рад слышать твой голос снова!</b>',
    '<b>😆Сегодня слышать тебя – большое удовольствие!</b>',
    '<b>🌟Ты такой талантливый разговорчик!</b>',
    '<b>🙃Ты меня радуешь своим голосом!</b>',
    '<b>💡Твой голос заряжает позитивом!</b>',
    '<b>🌻Ты как солнышко – всегда радуешь!</b>',
    '<b>🤩Ты звучишь, как звезда!</b>',
    '<b>🎵Твой голос – музыка для моих ушей!</b>'
];

  const onlyVoiceScene = new Scenes.BaseScene("onlyVoiceScene");

  onlyVoiceScene.enter(async (ctx) => {
    await ctx.replyWithHTML("<b>🗣Теперь я реагирую только на голосовые сообщения!</b>\n<i>Введите</i> <b>/exit</b><i>, чтобы выйти из этого режима</i>");
  });
  
  onlyVoiceScene.on("voice", async (ctx) => {
    const randomPhrase = getRandomPhrase();
    await ctx.replyWithHTML(randomPhrase);
  });
  
  onlyVoiceScene.command("exit", async (ctx) => {
    await ctx.scene.leave();
    await ctx.replyWithHTML("<b>🤖Теперь я реагирую на любые сообщения</b>");
    startMessage(ctx);
    await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> вышел из only voice`, {
        parse_mode: 'HTML'
    })
  });


  const interviewScene = new Scenes.WizardScene(
    "interviewScene",
    async (ctx) => {
        ctx.replyWithHTML('<b>⭐️Давай проведём небольшое интервью?</b>\n💬Я буду задавать тебе вопросы, а ты будешь на них отвечать, в конце я предоставлю небольшое резюме о тебе!\n\n<i>👶Начнём с первого вопроса, как тебя зовут?</i>')
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message) {
            await ctx.replyWithHTML('☹️<b>К этому я не был готов...</b>')
            return ctx.scene.reenter()
        }
        name = ctx.message.text;
        await ctx.replyWithHTML(` <b>⭐️Отлично, ${name}! Следующий вопрос:</b>\n💬Сколько тебе лет?`)
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message) {
            await ctx.replyWithHTML('☹️<b>К этому я не был готов...</b>')
            return ctx.scene.reenter()
        }
        age = parseInt(ctx.message.text);
        const ageWord = ageEnding(age);
        age = age + ' ' + ageWord
        await ctx.replyWithHTML(` <b>⭐️Так, тебе ${age}, записал! Последний вопрос:</b>\n💬Перечисли свои увлечения через запятую`)
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message) {
            await ctx.replyWithHTML('☹️<b>К этому я не был готов...</b>')
            return ctx.scene.reenter()
        }
        interests = ctx.message.text;
        await ctx.replyWithHTML(`<b>⭐️Спасибо, что ответил на все вопросы, вот информация о тебе</b>\n👶Тебя зовут: <b>${name}</b>\n🎍Твой возраст: <b>${age}</b>\n🧐Твои интересы: <b>${interests}</b>`);
        await startMessage(ctx);
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> прошёл интервью, результат:\n\n👶Тебя зовут: <b>${name}</b>\n🎍Твой возраст: <b>${age}</b>\n🧐Твои интересы: <b>${interests}</b>`, {
            parse_mode: 'HTML'
        })
        return ctx.scene.leave()
        
    }
  )

  const weatherScene = new Scenes.BaseScene("weatherScene");

weatherScene.enter(async (ctx) => {
  await ctx.replyWithHTML("🏙<b>Введите название города, чтобы узнать погоду</b>\n<i>Например: Москва</i>");
});

weatherScene.on("text", async (ctx) => {
  const cityName = ctx.message.text;
  const apiKey = "ceacdebd2fe63aa3b44be492cf945e19"; // замените на ваш API-ключ OpenWeatherMap

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=ru`
    );

    const weatherData = response.data;
    const description = weatherData.weather[0].description;
    const emoji = getEmoji(weatherData.weather[0].main);

    await ctx.replyWithHTML(`${emoji}Погода в <b>${cityName}</b>: ${description}\n🤒Температура: <b>${weatherData.main.temp.toFixed(1)}°C</b>`);
    startMessage(ctx);
    await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> узнал погоду в ${cityName}\n${emoji}${description}\n🤒Температура: <b>${weatherData.main.temp.toFixed(1)}°C</b>`, {
        parse_mode: 'HTML'
    })
    await ctx.scene.leave();
  } catch (error) {
    if (error.response && error.response.status === 404) {
        await ctx.replyWithHTML("❌<b>Город не найден</b>\n Пожалуйста, проверьте правильность написания и попробуйте снова");
    } else if (error.response && error.response.status === 401) {
        await ctx.replyWithHTML("⚠️<b>Произошла ошибка с авторизацией</b>\n Пожалуйста, свяжитесь с администратором");
    } else if (error.code === "ECONNABORTED") {
        await ctx.replyWithHTML("⏰<b>Время ожидания ответа от сервера истекло</b>\n Попробуйте еще раз");
    } else {
        await ctx.replyWithHTML("❗<b>Произошла ошибка при получении погоды</b>\n Попробуйте ввести город еще раз\n" + error);
    }
  }
});

function getEmoji(weatherMain) {
  switch (weatherMain) {
    case "Clear":
      return "☀️";
    case "Clouds":
      return "☁️";
    case "Rain":
    case "Drizzle":
      return "🌧️";
    case "Thunderstorm":
      return "⛈️";
    case "Snow":
      return "❄️";
    default:
      return "☁️";
  }
}

const reminderScene = new Scenes.BaseScene("reminderScene");

const kemerovoTimeZone = "Asia/Krasnoyarsk";

reminderScene.enter(async (ctx) => {
  await ctx.replyWithHTML("💭<b>Пожалуйста, введите текст напоминания</b>\n<i>Например: вынеси мусор</i>");
  ctx.scene.session.state = {
    step: 'text',
  };
});

reminderScene.on("text", async (ctx) => {
  if (ctx.scene.session.state.step === 'text') {
    ctx.scene.session.state.text = ctx.message.text;
    ctx.scene.session.state.step = 'datetime';

    await ctx.reply("Введите дату и время напоминания в формате ЧЧ:ММ ДД-ММ-ГГГГ или выберите время из предложенных вариантов:",
      Markup.inlineKeyboard([
        Markup.button.callback("🕐Через 1 час", "1hour"),
        Markup.button.callback("🕒Через 3 часа", "3hours"),
        Markup.button.callback("🕕Через 6 часов", "6hours"),
      ])
    );
  } else if (ctx.scene.session.state.step === 'datetime') {
    if (!moment(ctx.message.text, "HH:mm DD-MM-YYYY", true).isValid()) {
      await ctx.replyWithHTML("<b>❌Дата и время введены неправильно</b>\n<i>Попробуйте еще раз</i>");
      return;
    }

    const reminderTime = moment.tz(ctx.message.text, "HH:mm DD-MM-YYYY", kemerovoTimeZone).toDate();
    const reminderText = ctx.scene.session.state.text;

    schedule.scheduleJob(reminderTime, async () => {
      await ctx.replyWithHTML(`⏰Ваше напоминание: <b>${reminderText}</b>`);
    });

    await ctx.replyWithHTML(`📅Напоминание установлено на <b>${moment(reminderTime).format("YYYY-MM-DD HH:mm")}</b>`);
    ctx.scene.session.state = null;
    await ctx.scene.leave();
    await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> установил напоминание на ${reminderTime}\nТекст: ${reminderText}`, {
        parse_mode: 'HTML'
    })
  }
});

reminderScene.on("callback_query", async (ctx) => {
  if (ctx.scene.session.state.step === 'datetime') {
    const duration = parseInt(ctx.callbackQuery.data);
    const reminderTime = moment().add(duration, "hours").toDate();
    const reminderText = ctx.scene.session.state.text;

    schedule.scheduleJob(reminderTime, async () => {
      await ctx.replyWithHTML(`⏰Ваше напоминание: <b>${reminderText}</b>`);
    });
    await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> установил напоминание на ${reminderTime}\nТекст: ${reminderText}`, {
        parse_mode: 'HTML'
    })
    await ctx.replyWithHTML(`📅Напоминание установлено на <b>${moment(reminderTime).format("YYYY-MM-DD HH:mm")}</b>`);
    ctx.scene.session.state = null;
    await ctx.scene.leave();
  }
});

const attendanceScene = new Scenes.BaseScene("attendanceScene");

async function main() {
    const authClient = new google.auth.GoogleAuth({
      keyFile: "./telegram-bot-laba-3062a003881a.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  
    const auth = await authClient.getClient();
    return google.sheets({ version: "v4", auth });
  }
  
  main().then((sheets) => {


attendanceScene.enter(async (ctx) => {
    await ctx.replyWithHTML("💼<b>Введите ваше имя и фамилию</b>");
    ctx.scene.session.state = {
      step: "name",
    };
  });
  
  attendanceScene.on("text", async (ctx) => {
    const currentState = ctx.scene.session.state;
  
    if (currentState.step === "name") {
        const nameParts = ctx.message.text.split(" ");
        currentState.firstName = nameParts[0];
        currentState.lastName = nameParts[1];
        currentState.step = "group";
  
      await ctx.replyWithHTML("👥<b>Введите номер вашей группы</b>");
    } else if (currentState.step === "group") {
      currentState.group = ctx.message.text;
      currentState.step = "subject";
  
      await ctx.replyWithHTML("📘<b>Введите предмет, который вы посещаете</b>");
    } else if (currentState.step === "subject") {
      currentState.subject = ctx.message.text;
  
      const newRow = [
        new Date().toLocaleString(),
        currentState.firstName,
        currentState.lastName,
        currentState.group,
        currentState.subject,
      ];
  
      // Запись данных в таблицу Google Sheets
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: "1Y2IK9HfPx9wcrGzr78FZqZWZC99OemeanNy84iSfaWw",
          range: "Лист1!A:E",
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          resource: {
            values:  [newRow],
        },
      });
    
      await ctx.replyWithHTML("✅<b>Посещение засчитано!</b>");
      await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> внёс данные в таблицу\nИмя и фамилия: ${currentState.firstName} ${currentState.lastName}\nГруппа: ${currentState.group}\nПредмет: ${currentState.subject}`, {
        parse_mode: 'HTML'
        })
    } catch (error) {
      console.error("Ошибка записи в таблицу:", error);
      await ctx.replyWithHTML("❌<b>Ошибка!</b>\nПопробуйте ещё раз");
    }
    
    ctx.scene.session.state = null;
    await ctx.scene.leave();
    }
    });
  }).catch((err) => console.error(err));

  module.exports = { onlyVoiceScene, interviewScene, weatherScene, weatherScene, reminderScene, attendanceScene };
  