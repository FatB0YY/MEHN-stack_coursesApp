const multer = require('multer')

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'images')
    },
    filename(req, file, cb) {
        cb(
            null,
            `${new Date()
        .toISOString()
        .replace(/:/g, '-')}-${file.originalname.replace(/\s/g, '_')}`
        )
    },
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/heic']

const fileFiter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

module.exports = multer({
    storage: storage,
    fileFiter: fileFiter,
})