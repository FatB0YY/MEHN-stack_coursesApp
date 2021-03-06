const path = require('path')
const compression = require('compression')
const express = require('express')
const exphbs = require('express-handlebars')
    // mongoose
const mongoose = require('mongoose')

// helmet
const helmet = require('helmet')

// csurf
const csrf = require('csurf')

// flash
const flash = require('connect-flash')

// session
const session = require('express-session')

// mongodb-session
const MongoStore = require('connect-mongodb-session')(session)

// регестрируем роут
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cardRoutes = require('./routes/card')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')

// middleware
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const error404Handler = require('./middleware/404')
const fileMiddleware = require('./middleware/file')

const keys = require('./keys/index')

const app = express()

// создаем конфигурацию handlebars
const hbs = exphbs.create({
    // основной лэйаут
    defaultLayout: 'main',
    // название extension, по умолчанию handlebars
    extname: 'hbs',
    // новые определенные функции
    helpers: require('./utils/hbs-helpers'),
})

// MongoStore
const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI,
})

// теперь, чтобы зарегестрировать данный модуль как движок
// для рендеринга html страниц:
// первый - название движка
app.engine('hbs', hbs.engine) // регестрируем в express что есть такой движок
app.set('view engine', 'hbs') // мы его уже начинаем использовать
    // указываем вторым параметром название папки, где будут храниться наши шаблоны
app.set('views', 'pages')

// делаем папку public статической
app.use(express.static(path.join(__dirname, 'public')))
    // делаем папку images статической
app.use('/images', express.static(path.join(__dirname, 'images')))

// для того, чтобы обработать форму и не получить пустой объект:
// в nodeJS это прослушка события буффера и т.д
app.use(express.urlencoded({ extended: true }))

// настройка session
app.use(
    session({
        secret: keys.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store,
    })
)

// файлы
app.use(fileMiddleware.single('avatar'))

app.use(csrf())
app.use(flash())
app.use(compression())
app.use(helmet())

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'img-src': ["'self'", 'https:'],
            },
        },
    })
)

// подклюение varMiddleware
app.use(varMiddleware)
app.use(userMiddleware)

// также мы можем задавать префиксы
// это префиксы пути для роутов
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(error404Handler)

const PORT = process.env.PORT || 4000
    // подключение к MongoDB
async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })

        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}
start()