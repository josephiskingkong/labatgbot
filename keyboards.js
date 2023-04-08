const { Markup } = require('telegraf')

const startMessageKeyboard = ([
    [{ text: '📝Тестирование', callback_data: 'testingButton' }],
    [{ text: '🖥Программирование', callback_data: 'programmingButton' }],
    [{ text: '🤖Искусственный интеллект', callback_data: 'aiButton' }],
    [{ text: '⚙️Остальной функционал', callback_data: 'moreButton' }]
])

const moreMenuKeyboard = [
    [{ text: '❌Удалить клавиатуру', callback_data: 'removeKeyboard' }],
    [{ text: '☁️Узнать погоду', callback_data: 'weatherButton' }],
    [{ text: '⏰Создать напоминание', callback_data: 'reminderButton' }],
    [{ text: '📘Отметить посещение', callback_data: 'attendanceButton'}],
    [{ text: '🔙Вернуться назад', callback_data: 'goToMainMenu' }]
  ]

const mainMenuKeyboard = Markup.keyboard([
  ["🎤Реагировать только на голосовые сообщения"],
  ["😀Пройти интервью"]
]).resize(true);


module.exports = { startMessageKeyboard, mainMenuKeyboard, moreMenuKeyboard }