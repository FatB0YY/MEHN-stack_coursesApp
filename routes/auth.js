const { Router } = require('express')

const bcryptjs = require('bcryptjs')
const crypto = require('crypto')
const mailgun = require('mailgun-js')
const { validationResult } = require('express-validator')

const User = require('../models/user')
const keys = require('../keys/index')

const regMail = require('../emails/registration')
const resetMail = require('../emails/reset')
const { registerValidators, loginValidators } = require('../utils/validators')

const router = Router()

const api_key = keys.MAILGUN_API_KEY
const DOMAIN = keys.MAILGUN_DOMAIN
const mg = mailgun({ apiKey: api_key, domain: DOMAIN })

router.get('/login', async(req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError'),
    })
})

router.get('/logout', async(req, res) => {
    // req.session.isAuthenticated = false
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
})

router.post('/login', loginValidators, async(req, res) => {
    try {
        const { email, password } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg)
            return res.status(401).redirect('/auth/login#login')
        }

        const candidate = await User.findOne({ email })
        const areSame = await bcryptjs.compare(password, candidate.password)
        if (areSame) {
            req.session.user = candidate
            req.session.isAuthenticated = true
            req.session.save((error) => {
                if (error) throw error
                res.redirect('/')
            })
        } else {
            req.flash('loginError', 'Неверный пароль')
            res.redirect('/auth/login#login')
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/register', registerValidators, async(req, res) => {
    try {
        const { email, password, name } = req.body

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }

        const hashPassword = await bcryptjs.hash(password, 12)
        const user = new User({
            email: email,
            name: name,
            password: hashPassword,
            cart: {
                items: [],
            },
        })
        await user.save()
        res.redirect('/auth/login#login')

        let data = regMail(email)
        mg.messages().send(data, function(error, body) {
            if (error) {
                console.log('error:', error)
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error'),
    })
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async(error, buffer) => {
            if (error) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже')
                return res.redirect('/auth/reset')
            }
            const token = buffer.toString('hex')
            const candidate = await User.findOne({ email: req.body.email })

            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()

                let data = resetMail(candidate.email, token)
                mg.messages().send(data, function(error, body) {
                    if (error) {
                        console.log('error:', error)
                    }
                })

                res.redirect('/auth/login')
            } else {
                req.flash('error', 'Такого email нет')
                res.redirect('/auth/reset')
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/password/:token', async(req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() },
        })

        if (!user) {
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'Восстановить доступ',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token,
            })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/password', async(req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() },
        })

        if (user) {
            user.password = await bcryptjs.hash(req.body.password, 12)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', 'Время жизни токена истекло')
            res.redirect('/auth/login')
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router