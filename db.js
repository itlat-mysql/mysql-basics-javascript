const mysql2 = require('mysql2')
const dotenv = require("dotenv")
dotenv.config()

// константы для фильтрации
const OPERATION_EQUAL = 1
const OPERATION_LIKE = 2
const OPERATION_GREATER_EQ = 3
const OPERATION_LESS_EQ = 4

// инициализация соединения с базой данных (параметры берутся из переменных окружения + см. файл .env)
const connection = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset: process.env.DB_CHARSET,
    port: process.env.DB_PORT
}).promise();

/**
 * Трансформация объекта фильтрации в словарь, содержащий SQL строку (WHERE ... AND ...) и значения для фильтрации
 *
 * @param filtration
 * @returns {{whereQuery: string, whereValues: *[]}}
 */
function transformFiltrationToQueryWhereData(filtration) {
    const whereData = {whereQuery: '', whereValues: []};

    const filters = [];
    for (let rule of filtration.filters) {
        if (rule.operation === OPERATION_EQUAL) {
            filters.push(` ${rule.name} = ? `)
            whereData.whereValues.push(rule.value);
        } else if (rule.operation === OPERATION_LIKE) {
            filters.push(` ${rule.name} LIKE ? `)
            whereData.whereValues.push(`%${rule.value}%`);
        } else if (rule.operation === OPERATION_GREATER_EQ) {
            filters.push(` ${rule.name} >= ? `)
            whereData.whereValues.push(rule.value);
        } else if (rule.operation === OPERATION_LESS_EQ) {
            filters.push(` ${rule.name} <= ? `)
            whereData.whereValues.push(rule.value);
        }
    }

    if (filters.length) {
        whereData.whereQuery = ' WHERE ' + filters.join(' AND ')
    }

    return whereData;
}

module.exports = {
    connection,
    transformFiltrationToQueryWhereData,
    OPERATION_EQUAL,
    OPERATION_LIKE,
    OPERATION_GREATER_EQ,
    OPERATION_LESS_EQ
}