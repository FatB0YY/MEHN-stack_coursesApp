const { Router } = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const { validationResult } = require('express-validator')
const { courseValidators } = require('../utils/validators')
const router = Router()

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString()
}

router.get('/', async(req, res) => {
    try {
        const courses = await Course.find()
            .populate('userId', 'email name')
            .select('price title img')

        const fixedCourses = courses.map((i) => i.toObject())

        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses: fixedCourses,
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/edit', auth, async(req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }

    try {
        // findById аналог getById, т.е индекс нужного нам курса
        const course = await Course.findById(req.params.id)

        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course: course.toObject(),
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', auth, courseValidators, async(req, res) => {
    const { id } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }

    try {
        delete req.body.id
        const course = await Course.findById(id)

        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        Object.assign(course, req.body)
        await course.save()
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

router.post('/remove', auth, async(req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id,
        })
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id', async(req, res) => {
    try {
        // findById аналог getById, т.е индекс нужного нам курса
        const course = await Course.findById(req.params.id)

        res.render('course', {
            layout: 'empty',
            title: `Курс ${course.title}`,
            course: course.toObject(),
        })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router