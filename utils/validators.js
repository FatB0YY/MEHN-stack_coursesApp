const { body } = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('email')
    .isEmail()
    .withMessage('Введите корректный Email')
    .normalizeEmail()
    .custom(async(value, { req }) => {
        try {
            const candidate = await User.findOne({ email: value })
            if (candidate) {
                return Promise.reject('Такой email уже занят')
            }
        } catch (error) {
            console.log(error)
        }
    }),

    body('password')
    .isLength({ min: 8, max: 56 })
    .isAlphanumeric()
    .withMessage('Пароль минимум 8 символов')
    .trim(),

    body('confirm')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Пароли должны совпадать')
        } else {
            return true
        }
    })
    .trim(),

    body('name')
    .isLength({ min: 3, max: 56 })
    .withMessage('Имя минимум 3 символа')
    .trim(),
]

exports.loginValidators = [
    body('email')
    .isEmail()
    .withMessage('Введите корректный Email')
    .normalizeEmail()
    .custom(async(value, { req }) => {
        try {
            const candidate = await User.findOne({ email: value })
            if (!candidate) {
                return Promise.reject('Такого пользователя не существует')
            }
        } catch (error) {
            console.log(error)
        }
    }),

    body('password')
    .isLength({ min: 8, max: 56 })
    .withMessage('Пароль минимум 8 символов')
    .isAlphanumeric()
    .trim(),
]

exports.courseValidators = [
    body('title')
    .isLength({ min: 3, max: 56 })
    .withMessage('Минимальная длинна названия 3 символа')
    .trim(),
    body('price').isNumeric().withMessage('Введите корректную цену'),
    body('img', 'Введите корректный Url картинки').isURL(),
]