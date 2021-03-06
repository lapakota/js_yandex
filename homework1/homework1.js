'use strict';

/**
 * Складывает два целых числа
 * @param {Number} a Первое целое
 * @param {Number} b Второе целое
 * @throws {TypeError} Когда в аргументы переданы не числа
 * @returns {Number} Сумма аргументов
 */
function abProblem(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number')
        throw new TypeError;
    return a + b;
}

/**
 * Определяет век по году
 * @param {Number} year Год, целое положительное число
 * @throws {TypeError} Когда в качестве года передано не число
 * @throws {RangeError} Когда год – отрицательное значение
 * @returns {Number} Век, полученный из года
 */
function centuryByYearProblem(year) {
    if (!Number.isInteger(year))
        throw new TypeError;
    if (year < 0)
        throw new RangeError;
    return Math.ceil(year / 100);
}

/**
 * Переводит цвет из формата HEX в формат RGB
 * @param {String} hexColor Цвет в формате HEX, например, '#FFFFFF'
 * @throws {TypeError} Когда цвет передан не строкой
 * @throws {RangeError} Когда значения цвета выходят за пределы допустимых
 * @returns {String} Цвет в формате RGB, например, '(255, 255, 255)'
 */
function colorsProblem(hexColor) {
    if (typeof hexColor !== 'string')
        throw new TypeError;
    let regexp = /^#[0-9a-fA-F]{6}$/g;
    if (hexColor.search(regexp) === -1)
        throw new RangeError;
    let rgb = [];
    for (let i = 1; i <= 5; i += 2) {
        let value = parseInt(hexColor.substring(i, i + 2), 16);
        rgb.push(value);
    }
    return `(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

/**
 * Находит n-ое число Фибоначчи
 * @param {Number} n Положение числа в ряде Фибоначчи
 * @throws {TypeError} Когда в качестве положения в ряде передано не число
 * @throws {RangeError} Когда положение в ряде не является целым положительным числом
 * @returns {Number} Число Фибоначчи, находящееся на n-ой позиции
 */
function fibonacciProblem(n) {
    if (typeof n !== 'number')
        throw new TypeError;
    if (!Number.isInteger(n) || n <= 0)
        throw new RangeError;
    let a = 1;
    let b = 1;
    for (let i = 3; i <= n; i++) {
        let c = a + b;
        a = b;
        b = c;
    }
    return b;
}

/**
 * Транспонирует матрицу
 * @param {(Any[])[]} matrix Матрица размерности MxN
 * @throws {TypeError} Когда в функцию передаётся не двумерный массив
 * @returns {(Any[])[]} Транспонированная матрица размера NxM
 */
function matrixProblem(matrix) {
    if (!is2dArr(matrix))
        throw new TypeError;
    let transposedMatrix = [];
    for (let i = 0; i < matrix[0].length; i++) {
        transposedMatrix.push([]);
        for (let j = 0; j < matrix.length; j++) {
            transposedMatrix[i].push(matrix[j][i]);
        }
    }
    return transposedMatrix;
}

function is2dArr(matrix) {
    if (Array.isArray(matrix)) {
        for (let i = 0; i < matrix.length; i++) {
            if (!Array.isArray(matrix[i])
                || matrix[i].length !== matrix[0].length)
                return false;
        }
        return true;
    }
}

/**
 * Переводит число в другую систему счисления
 * @param {Number} n Число для перевода в другую систему счисления
 * @param {Number} targetNs Система счисления, в которую нужно перевести (Число от 2 до 36)
 * @throws {TypeError} Когда переданы аргументы некорректного типа
 * @throws {RangeError} Когда система счисления выходит за пределы значений [2, 36]
 * @returns {String} Число n в системе счисления targetNs
 */
function numberSystemProblem(n, targetNs) {
    if (typeof n !== 'number' || !Number.isInteger(targetNs))
        throw new TypeError;
    if (targetNs < 2 || targetNs > 36)
        throw new RangeError;
    return n.toString(targetNs);
}

/**
 * Проверяет соответствие телефонного номера формату
 * @param {String} phoneNumber Номер телефона в формате '8–800–xxx–xx–xx'
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Boolean} Если соответствует формату, то true, а иначе false
 */
function phoneProblem(phoneNumber) {
    if (typeof phoneNumber !== 'string')
        throw new TypeError;
    let regexp = /^8-800-\d{3}-\d{2}-\d{2}$/;
    return phoneNumber.search(regexp) !== -1
}

/**
 * Определяет количество улыбающихся смайликов в строке
 * @param {String} text Строка в которой производится поиск
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Number} Количество улыбающихся смайликов в строке
 */
function smilesProblem(text) {
    if (typeof text !== 'string')
        throw new TypeError;
    let regexp = /:-\)|\(-:/g;
    let result = Array.from(text.matchAll(regexp));
    return result.length !== 0 ? result.length : 0;
}

/**
 * Определяет победителя в игре "Крестики-нолики"
 * Тестами гарантируются корректные аргументы.
 * @param {(('x' | 'o')[])[]} field Игровое поле 3x3 завершённой игры
 * @returns {'x' | 'o' | 'draw'} Результат игры
 */
function ticTacToeProblem(field) {
    let xWinPattern = 'xxx'
    let oWinPattern = 'ooo'
    let results = []

    results.push(
        field[0][0] + field[1][1] + field[2][2],
        field[2][0] + field[1][1] + field[0][2])
    for (let i = 0; i < field.length; i++) {
        results.push(
            field[i].reduce((a, b) => (a + b)),
            field[0][i] + field[1][i] + field[2][i])
    }
    return results.includes(xWinPattern) ? 'x' : results.includes(oWinPattern) ? 'o' : 'draw'
}

module.exports = {
    abProblem,
    centuryByYearProblem,
    colorsProblem,
    fibonacciProblem,
    matrixProblem,
    numberSystemProblem,
    phoneProblem,
    smilesProblem,
    ticTacToeProblem
};