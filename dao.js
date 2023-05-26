const db = require('./db')

class Filtration {
    constructor() {
        this.filters = []
    }

    /**
     * Применение фильтра для строгого сравнения (=)
     *
     * @param name
     * @param value
     * @param maxSize
     * @returns {Filtration}
     */
    equal(name, value, maxSize = null) {
        if (this.validate(value, maxSize)) {
            this.filters.push({name, value, operation: db.OPERATION_EQUAL})
        }
        return this
    }

    /**
     * Применение фильтра для нестрогого сравнения (LIKE)
     *
     * @param name
     * @param value
     * @param maxSize
     * @returns {Filtration}
     */
    like(name, value, maxSize = null) {
        if (this.validate(value, maxSize)) {
            this.filters.push({name, value, operation: db.OPERATION_LIKE})
        }
        return this
    }

    /**
     * Применение фильтра для сравнения на больше или равно (>=)
     *
     * @param name
     * @param value
     * @param maxSize
     * @returns {Filtration}
     */
    greaterEqual(name, value, maxSize = null) {
        if (this.validate(value, maxSize)) {
            this.filters.push({name, value, operation: db.OPERATION_GREATER_EQ})
        }
        return this
    }

    /**
     * Применение фильтра для сравнения на меньше или равно (<=)
     *
     * @param name
     * @param value
     * @param maxSize
     * @returns {Filtration}
     */
    lessEqual(name, value, maxSize = null) {
        if (this.validate(value, maxSize)) {
            this.filters.push({name, value, operation: db.OPERATION_LESS_EQ})
        }
        return this
    }

    /**
     * Проверка значения для фильтрации (не должно быть пустой строкой, а его длина не должна превышать лимита)
     *
     * @param value
     * @param maxSize
     * @returns {boolean}
     */
    validate(value, maxSize = null) {
        if (!(typeof value === 'string') || value === '') {
            return false
        }
        if (maxSize !== null && value.length > maxSize) {
            return false
        }
        return true
    }
}

class ProductDao {
    /**
     * Простой запрос на выбор все строк с сортировкой по столбцу created_at (по возрастанию)
     *
     * @returns {Promise<unknown>}
     */
    static getAllProducts() {
        const query = 'SELECT id, name, ean, price, created_at FROM products ORDER BY created_at ASC;'

        return db.connection.query(query).then(result => {
            return result[0]
        }).catch(err => { throw err })
    }

    /**
     * Запрос, позволяющий пропустить несколько строк и ограничить количество получаемых строк
     *
     * @param limit
     * @param offset
     * @returns {Promise<unknown>}
     */
    static getProductsWithLimitAndOffset(limit, offset) {
        const query = 'SELECT id, name, ean, price, created_at FROM products ORDER BY created_at ASC LIMIT ? OFFSET ?;'

        return db.connection.query(query, [limit, offset]).then(result => {
            return result[0]
        }).catch(err => { throw err })
    }

    /**
     * Запрос, подсчитывающий количество строк в таблице
     *
     * @returns {Promise<unknown>}
     */
    static getProductsQty() {
        const query = 'SELECT COUNT(*) AS qty FROM products;'

        return db.connection.query(query).then(result => {
            return parseInt(result[0][0]['qty'])
        }).catch(err => { throw err })
    }

    /**
     * Запрос, возвращающий продукт, который содержит id, равный присланному значению product_id
     *
     * @param productId
     * @returns {Promise<unknown>}
     */
    static getSingleProduct(productId) {
        const query = 'SELECT id, name, ean, price, created_at FROM products WHERE id = ?;'

        return db.connection.query(query, [productId]).then(result => {
            return result[0].length ? result[0][0] : null
        }).catch(err => { throw err })
    }

    /**
     * Запрос, который возвращает строки, соответствующие присланным условиям фильтрации
     *
     * @param filtration
     * @returns {Promise<unknown>}
     */
    static getProductsWithFiltration(filtration) {
        const queryWhereData = db.transformFiltrationToQueryWhereData(filtration);
        const query = `SELECT id, name, ean, price, created_at
                       FROM products ${queryWhereData.whereQuery}
                       ORDER BY created_at ASC;`

        return db.connection.query(query, queryWhereData.whereValues).then(result => {
            return result[0]
        }).catch(err => { throw err })
    }
}

module.exports = {ProductDao, Filtration}