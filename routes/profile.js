const { Router } = require('express')
const fs = require('fs')
const path = require('path')
const auth = require('../middleware/auth')
const User = require('../models/user')
const router = Router()

router.get('/', auth, async(req, res) => {
    res.render('profile', {
        title: 'Страница профиля',
        isProfile: true,
        user: req.user.toObject(),
    })
})

router.post('/', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user._id)

        const toChange = {
            name: req.body.name,
        }

        if (req.file) {
            // // удаление пред аватарки, если она есть
 
            // if(user.avatarUrl){
            //     const fileName = user.avatarUrl.slice(7)
            //     if (fileName.length != 0 || fileName != '') {
            //         const url = path.join(__dirname, '../images', `${fileName}`)

            //         if (!url.length == 0) {
            //             try {
            //                 fs.unlink(url, (error) => {
            //                if (error) throw error
            //           })
            //             } catch (error) {
            //             console.log(error)
            //             }
            //         }
            
            // }
            // }
            
            

            toChange.avatarUrl = req.file.path
        }

        Object.assign(user, toChange)

        await user.save()
        res.redirect('/profile')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router