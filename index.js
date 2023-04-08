const { Telegraf, Markup, Scenes, session } = require("telegraf");
const { startMessageKeyboard, mainMenuKeyboard, moreMenuKeyboard } = require("./keyboards");

const { onlyVoiceScene, interviewScene, weatherScene, reminderScene, attendanceScene } = require('./scenes.js')

const bot = new Telegraf("6261984727:AAGhPHUCp-Xe5MefNiyz24DSrWencl3ULR8");

const stage = new Scenes.Stage([onlyVoiceScene, interviewScene, weatherScene, reminderScene, attendanceScene]);
bot.use(session());
bot.use(stage.middleware());

async function startMessage(ctx) {
    await ctx.replyWithHTML(`<i>👋Привет,  <b>${ctx.from.first_name}</b>\n🤖Ниже приведены кнопки и клавиатура для демонстрации функционала бота</i>`, {
        reply_markup: {
            inline_keyboard: startMessageKeyboard,
        }
    });
    await ctx.replyWithHTML('<b>⌨️Клавиатура загружена!</b>', mainMenuKeyboard)
}

bot
    .command("start", async (ctx) => {
        startMessage(ctx);
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> написал /start`, {
            parse_mode: 'HTML'
        })
    })

    .action("testingButton", async (ctx) => {
        ctx.replyWithHTML(
            "<b>🗒Список ресурсов, посвященных тестированию:\n\n</b><i>1. </i><b>https://software-testing.ru/forum/</b><i>\nФорум тестировщиков, ничего более\n\n</i><i>2. </i><b>https://habr.com/ru/companies/habr_career/articles/517812/</b><i>\nСтатья на хабре о тестировании</i>"
        );

        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> нажал на кнопку Тестирование`, {
            parse_mode: 'HTML'
        })
    })

    .action("programmingButton", async (ctx) => {
        ctx.replyWithHTML(
            "<b>🗒Список ресурсов, посвященных программированию:\n\n</b><i>1. </i><b>https://ru.stackoverflow.com/tour</b><i>\nЗдесь даже сказать нечего. Склад умов, ответы на любые вопросы. Заповеди.\n\n</i><i>2. </i><b>https://ru.hexlet.io/courses/introduction_to_programming</b>\n<i>Вводный курс по основам программирования\n</i>\n<i>3.</i> <b>https://habr.com/ru/hub/programming/</b><i>\nТопик по программированию на хабре</i>"
        );
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> нажал на кнопку Программирование`, {
            parse_mode: 'HTML'
        })
    })

    .action("aiButton", async (ctx) => {
        ctx.replyWithHTML(
            "<b>🗒Список ресурсов, посвященных искуственному интеллекту:\n\n</b><i>1. </i><b>https://habr.com/ru/hub/artificial_intelligence/</b><i>\nСтатья на хабре об искусственном интеллекте\n\n</i><i>2. </i><b>https://ru.wikipedia.org/wiki/Искусственный_интеллект</b>\n<i>Статья на википедии</i>"
        );
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> нажал на кнопку ИИ`, {
            parse_mode: 'HTML'
        })
    })

    .action("moreButton", async (ctx) => {
        try {
            const message = ctx.callbackQuery.message;
            const currentKeyboard = message.reply_markup;
            if (currentKeyboard) {
                // Удаляем текущую клавиатуру
                await ctx.editMessageReplyMarkup(null);
            }
            // Устанавливаем новую клавиатуру
            await ctx.editMessageText(
                "🖥<b>Дополнительное меню для взаимодействия с ботом</b>",
                {
                    parse_mode: "html",
                    reply_markup: {
                        inline_keyboard: moreMenuKeyboard,
                    },
                }
            );
            await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> открыл доп меню`, {
                parse_mode: 'HTML'
            })
        } catch (error) {
            console.log(error);
        }
    })

    .action("goToMainMenu", async (ctx) => {
        try {
            const message = ctx.callbackQuery.message;
            const currentKeyboard = message.reply_markup;
            if (currentKeyboard) {
                // Удаляем текущую клавиатуру
                await ctx.editMessageReplyMarkup(null);
            }
            // Устанавливаем новую клавиатуру
            await ctx.editMessageText(`<i>👋Привет,  <b>${ctx.from.first_name}</b>\n⌨️Ниже приведены кнопки и клавиатура для демонстрации функционала бота\n<b>🍀Удачи!</b></i>`,
                {
                    parse_mode: "html",
                    reply_markup: {
                        inline_keyboard: startMessageKeyboard,
                    },
                }
            );
            await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> вернулся в основное меню`, {
                parse_mode: 'HTML'
            })
        } catch (error) {
            console.log(error);
        }
    })

    .action("removeKeyboard", async (ctx) => {
        const options = {
            reply_markup: {
                remove_keyboard: true,
            },
        };
        bot.telegram
            .sendMessage(ctx.from.id, "🔄Загрузка...", options)
            .then((sentMessage) => {
                const messageId = sentMessage.message_id;

                // Удаляем сообщение
                bot.telegram.deleteMessage(ctx.chat.id, messageId);
            });
        ctx.replyWithHTML('<b>⌨️Клавиатура успешно удалена</b>\n<i>Чтобы вернуть её, напишите</i> <b>/start</b>')
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> удалил клавиатуру`, {
            parse_mode: 'HTML'
        })
    })

    .hears('🎤Реагировать только на голосовые сообщения', async (ctx) => {
        ctx.scene.enter('onlyVoiceScene');
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> перешёл в режим только голосовых сообщений`, {
            parse_mode: 'HTML'
        })
    })
    
    .hears('😀Пройти интервью', async (ctx) => {
        ctx.scene.enter('interviewScene')
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> перешёл в режим интервью`, {
            parse_mode: 'HTML'
        })
    })

    .action('weatherButton', async (ctx) => {
        ctx.scene.enter('weatherScene')
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> отркыл меню погоды`, {
            parse_mode: 'HTML'
        })
    })

    .action('reminderButton', async (ctx) => {
        ctx.scene.enter('reminderScene')
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> открыл меню напоминаний`, {
            parse_mode: 'HTML'
        })
    })

    .action('attendanceButton', async (ctx) => {
        ctx.scene.enter('attendanceScene')
        await bot.telegram.sendMessage(-984580648, `<b>@${ctx.from.username}</b> открыл меню отметок`, {
            parse_mode: 'HTML'
        })
    })


bot.launch();
