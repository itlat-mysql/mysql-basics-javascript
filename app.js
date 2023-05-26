const express = require('express')
const dao = require('./dao.js')
const app = express()
const port = 8002


// подключение шаблонизатора
app.set('view engine', 'ejs')


// подключение пути для статических файлов
app.use(express.static('static'))


// создание посредника, который будет добавлять в шаблоны пункты меню и устанавливать активный пункт меню
app.use(function (req, res, next) {
    const menu = [
        {path: '/', name: 'All Products'},
        {path: '/pages/', name: 'Pages'},
        {path: '/search/', name: 'Search'}
    ]

    let activeMenuItem = null
    menu.forEach((menuItem) => {
        if (menuItem.path === req.path || menuItem.path.slice(0, -1) === req.path) {
            activeMenuItem = menuItem.path
        }
    })

    res.locals = {menu, activeMenuItem, req}
    next()
})


// показываем все продукты безо всяких условий
app.get('/', (req, res) => {
    dao.ProductDao.getAllProducts().then((products) => {
        res.render('pages/show-all-products', {products})
    })
})


// показываем продукты по несколько штук на странице (с использованием постраничной навигации)
app.get('/pages/', (req, res) => {
    let page = 0;
    let pages = 0;

    dao.ProductDao.getProductsQty().then((quantity) => {
        page = parseInt(req.query.page)
        if (isNaN(page)  || page > Number.MAX_SAFE_INTEGER || page < 1) {
            page = 1
        }

        const qtyPerPage = 2
        pages = Math.ceil(quantity / qtyPerPage)
        const currentOffset = (page - 1) * qtyPerPage

        if (page > pages) {
            return Promise.reject()
        } else {
            return dao.ProductDao.getProductsWithLimitAndOffset(qtyPerPage, currentOffset)
        }
    }).then((products) => {
        res.render('pages/split-products-by-pages', {products, pages, page})
    }).catch(() => {
        res.sendStatus(404)
    })
})


// показываем продукты, которые соответствуют присланным в запросе условиям
app.get('/search/', (req, res) => {
    const filtration = new dao.Filtration()
        .equal('id', req.query.id, 255)
        .like('name', req.query.name, 255)
        .like('ean', req.query.ean, 255)
        .greaterEqual('price', req.query.price_gte, 255)
        .lessEqual('price', req.query.price_lte, 255)

    dao.ProductDao.getProductsWithFiltration(filtration).then((products) => {
        res.render('pages/search-products', {products})
    })
})


// показываем один конкретный продукт
app.get('/product/:productId(\\d+)', (req, res) => {
    const productInt = parseInt(req.params['productId'])

    // если пришло неправильное или слишком большое число - уведомим пользователя, что ничего не найдено
    if (isNaN(productInt) || productInt > Number.MAX_SAFE_INTEGER) {
        res.sendStatus(404)
    } else {
        dao.ProductDao.getSingleProduct(parseInt(req.params['productId'])).then((product) => {
            product ? res.render('pages/show-single-product', {product}) : res.sendStatus(404)
        })
    }
})


// запуск приложения
app.listen(port)