/* eslint-env mocha */
/* eslint-disable max-statements */
'use strict';

const assert = require('assert');

const pbql = require('./pbql');

describe('pbql.run', () => {
    beforeEach(() => {
        pbql.phoneBook.clear();
    });

    it('должен возвращать пустой массив, если контактов нет', () => {
        assert.deepStrictEqual(
            pbql.run(
                'Покажи имя для контактов, где есть ий;'
            ),
            []
        );
    });

    it('должен находить контакты по запросу "ий"', () => {
        assert.deepStrictEqual(
            pbql.run(
                'Создай контакт Григорий;' +
                'Создай контакт Василий;' +
                'Создай контакт Иннокентий;' +
                'Покажи имя для контактов, где есть ий;'
            ),
            [
                'Григорий',
                'Василий',
                'Иннокентий'
            ]
        );
    });

    it('должен выводить поля произвольное количество раз', () => {
        assert.deepStrictEqual(
            pbql.run(
                'Создай контакт Григорий;' +
                'Создай контакт Василий;' +
                'Создай контакт Иннокентий;' +
                'Покажи имя и имя и имя для контактов, где есть ий;'
            ),
            [
                'Григорий;Григорий;Григорий',
                'Василий;Василий;Василий',
                'Иннокентий;Иннокентий;Иннокентий'
            ]
        );
    });

    it('должен конкатенировать результаты', () => {
        assert.deepStrictEqual(
            pbql.run(
                'Создай контакт Григорий;' +
                'Покажи имя для контактов, где есть ий;' +
                'Покажи имя для контактов, где есть ий;'
            ),
            [
                'Григорий',
                'Григорий'
            ]
        );
    });

    it('должен удалять контакт по имени', () => {
        assert.deepStrictEqual(
            pbql.run(
                'Создай контакт Григорий;' +
                'Удали контакт Григорий;' +
                'Покажи имя для контактов, где есть ий;'
            ),
            []
        );
    });

    it('должен добавлять телефон и почту для контакта', () => {
        assert.deepStrictEqual(
            pbql.run(
                'Создай контакт Григорий;' +
                'Добавь телефон 5556667787 для контакта Григорий;' +
                'Добавь телефон 5556667788 и почту grisha@example.com для контакта Григорий;' +
                'Покажи имя и телефоны и почты для контактов, где есть ий;'
            ),
            [
                'Григорий;+7 (555) 666-77-87,+7 (555) 666-77-88;grisha@example.com'
            ]
        );
    });

    it('должен удалять телефон контакта', () => {
        assert.deepStrictEqual(
            pbql.run(
                'Создай контакт Григорий;' +
                'Добавь телефон 5556667788 для контакта Григорий;' +
                'Удали телефон 5556667788 для контакта Григорий;' +
                'Покажи имя и телефоны для контактов, где есть ий;'
            ),
            [
                'Григорий;'
            ]
        );
    });

    it('должен удалять все контакты по запросу "ий"', () => {
        assert.deepStrictEqual(
            pbql.run(
                'Создай контакт Григорий;' +
                'Создай контакт Василий;' +
                'Создай контакт Иннокентий;' +
                'Удали контакты, где есть ий;' +
                'Покажи имя для контактов, где есть ий;'
            ),
            []
        );
    });

    it('должен проверять регистр команд', () => {
        assert.throws(() =>
                pbql.run(
                    'покажи имя для контактов, где есть Гр;'
                ),
            /at 1:1$/
        );
    });

    it('должен проверять опечатки в командах', () => {
        assert.throws(() =>
                pbql.run(
                    'Покжи имя для контактов, где есть Гр;'
                ),
            /at 1:1$/
        );
    });

    it('должен проверять наличие лишних пробелов', () => {
        assert.throws(() =>
                pbql.run(
                    'Покажи  имя для контактов, где есть Гр;'
                ),
            /at 1:8$/
        );
    });

    it('должен проверять правильность формата номеров', () => {
        assert.throws(() =>
                pbql.run(
                    'Удали телефон 55566677 для контакта Григорий;'
                ),
            /at 1:15$/
        );
    });

    it('должен находить ошибку во второй команде', () => {
        assert.throws(() =>
                pbql.run(
                    'Покажи имя для контактов, где есть ий;' +
                    'Say my name для контактов, где есть W;'
                ),
            /at 2:1$/
        );
    });

    it('должен проверять наличие ;', () => {
        assert.throws(() =>
                pbql.run(
                    'Покажи имя для контактов, где есть Гр'
                ),
            /at 1:38$/
        );
    });
});