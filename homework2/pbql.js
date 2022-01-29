'use strict';

/**
 * Телефонная книга
 */
const phoneBook = new Map();

const phoneRegexp = /^\d{10}$/;
const formattedPhoneRegexp = /^(\d{3})(\d{3})(\d{2})(\d{2})$/;
const formattedPhoneString = '+7 ($1) $2-$3-$4';

const SyntaxErrors = {
    DOUBLE_SPACE: '  ',
    EMPTY_STRING: '',
};

const CommandsSyntax = {
    CREATE: 'Создай',
    DELETE: 'Удали',
    ADD: 'Добавь',
    SHOW: 'Покажи',
};

const Syntax = {
    CONTACT: 'контакт',
    CONTACTS: 'контакты,',
    FOR_CONTACT: 'контакта',
    FOR_CONTACTS: 'контактов,',
    PHONE: 'телефон',
    PHONES: 'телефоны',
    EMAIL: 'почту',
    EMAILS: 'почты',
    NAME: 'имя',
    WHERE: 'где',
    EXIST: 'есть',
    FOR: 'для',
    AND: 'и',
    SPACE: ' ',
    COMMA: ',',
    END: ';',
};

const commands = {
    createContact: {
        isThisCommand: (words) => {
            return words[1] === Syntax.CONTACT;
        },
        run: (name) => {
            if (!phoneBook.has(name))
                phoneBook.set(name, {'emails': [], 'phones': []});
        }
    },

    deleteContact: {
        isThisCommand: (words) => {
            return words[1] === Syntax.CONTACT;
        },
        run: (name) => {
            if (phoneBook.has(name))
                phoneBook.delete(name);
        }
    },

    deleteContactsEntry: {
        isThisCommand: (words) => {
            return words[1] === Syntax.CONTACTS;
        },
        run: (entryData) => {
            if (entryData === SyntaxErrors.EMPTY_STRING)
                return;

            for (const contact of phoneBook) {
                if (utils.isDataInPhoneBook(contact, entryData))
                    commands.deleteContact.run(contact[0]);
            }
        }
    },

    deleteFields: {
        isThisCommand: (words) => {
            return [Syntax.PHONE, Syntax.EMAIL].includes(words[1]);
        },
        run: (name, phones = [], emails = []) => {
            let contact = phoneBook.get(name);

            if (typeof contact === "undefined")
                return;
            utils.deleteDataFromContact(contact, emails, 'emails');
            utils.deleteDataFromContact(contact, phones, 'phones');
        }
    },

    addPhonesAndEmails: {
        isThisCommand: (words) => {
            return [Syntax.PHONE, Syntax.EMAIL].includes(words[1]);
        },
        run: (name, phones = [], emails = []) => {
            let contact = phoneBook.get(name);

            if (typeof contact === "undefined")
                return;
            utils.addDataToContact(contact, emails, 'emails');
            utils.addDataToContact(contact, phones, 'phones');
        }
    },

    showEntryInfo: {
        isThisCommand: (words) => {
            return [Syntax.NAME, Syntax.PHONES, Syntax.EMAILS].includes(words[1]);
        },
        run: (entryData, fieldsSequence) => {
            let result = [];

            for (const contact of phoneBook) {
                if (!utils.isDataInPhoneBook(contact, entryData))
                    continue;
                let parsedData = utils.parseFieldsFromContact(contact, fieldsSequence);
                result.push(parsedData);
            }
            return result[0] === SyntaxErrors.EMPTY_STRING || entryData === SyntaxErrors.EMPTY_STRING
                ? []
                : result;
        }
    },
};

const utils = {
    isDataInArray: (arr, data) => {
        return arr.some(element => element.includes(data));
    },

    getFieldData: (contact, fieldName) => {
        switch (fieldName) {
            case Syntax.NAME:
                return [contact[0]];
            case Syntax.PHONES:
                let phones = utils.parseFieldElements(contact, 'phones');
                return utils.formatPhones(phones);
            case Syntax.EMAILS:
                return utils.parseFieldElements(contact, 'emails');
        }
    },

    parseFieldsFromContact: (contact, fieldsSequence) => {
        let result = fieldsSequence.map(fieldName => utils.getFieldData(contact, fieldName));
        return result.join(Syntax.END);
    },

    parseFieldElements: (contact, type) => {
        let result = [];
        let elements = contact[1][type];
        elements.length > 0 && result.push(elements.join(Syntax.COMMA));
        return result;
    },

    isDataInPhoneBook: (contact, data) => {
        return contact[0].includes(data)
            || utils.isDataInArray(contact[1].emails, data)
            || utils.isDataInArray(contact[1].phones, data);
    },

    countMistakeIndex: (words, index) => {
        return words.slice(0, index).reduce((sum, x) => sum + x.length + 1, 0) + 1;
    },

    addDataToContact: (contact, arr, type) => {
        for (let el of arr)
            if (!contact[type].includes(el))
                contact[type].push(el);
    },

    deleteDataFromContact: (contact, arr, type) => {
        for (let el of arr)
            contact[type] = contact[type].filter(x => x !== el);
    },

    formatPhones: (phones) => {
        let formattedPhones = [];
        for (let arr of phones) {
            let parsedPhones = arr.split(Syntax.COMMA)
                .map(phone => phone.replace(formattedPhoneRegexp, formattedPhoneString));
            formattedPhones.push(parsedPhones.join(Syntax.COMMA))
        }
        return formattedPhones;
    },

    isInvalidTransition: (type, wasBridgingBefore, i, approvedFields) => {
        return !approvedFields.includes(type)
            ? true
            : type !== Syntax.FOR
                ? !wasBridgingBefore && i !== 1
                : false;
    },

    parseTypeAndData: (words, commandIndex, index, wasBridgingBefore, approvedFields) => {
        if (words[index] === Syntax.AND) {
            index++;
            wasBridgingBefore = true;
        }
        let type = words[index];
        let data = words[index + 1];

        if (utils.isInvalidTransition(type, wasBridgingBefore, index, approvedFields))
            syntaxError(commandIndex, utils.countMistakeIndex(words, index));
        return [type, data, index];
    },

    parseAddAndDeleteRequests: (words, commandIndex) => {
        const approvedFields = [Syntax.PHONE, Syntax.EMAIL, Syntax.FOR];

        let name;
        let phones = [];
        let emails = [];

        let wasBridgingBefore = false;
        for (let i = 1; i < words.length; i += 2) {
            let [type, data, newIndex] =
                utils.parseTypeAndData(words, commandIndex, i, wasBridgingBefore, approvedFields);
            i = newIndex;

            if (type === Syntax.PHONE && phoneRegexp.test(data)) {
                phones.push(data);
            } else if (type === Syntax.EMAIL) {
                emails.push(data);
            } else if (type === Syntax.FOR && data === Syntax.FOR_CONTACT) {
                name = words.slice(i + 2).join(Syntax.SPACE);
                break;
            } else
                syntaxError(commandIndex, utils.countMistakeIndex(words, i + 1));
            wasBridgingBefore = false;
        }
        return [name, phones, emails];
    },

    parseShowRequests: (words, commandIndex) => {
        const approvedFields = [Syntax.NAME, Syntax.PHONES, Syntax.EMAILS, Syntax.FOR];

        let entryData;
        let fieldsSequence = [];

        let wasBridgingBefore = false;
        for (let i = 1; i < words.length; i++) {
            let [type, data, newIndex] =
                utils.parseTypeAndData(words, commandIndex, i, wasBridgingBefore, approvedFields);
            i = newIndex;

            if (utils.isField(type))
                fieldsSequence.push(type);
            else if (type === Syntax.FOR && data === Syntax.FOR_CONTACTS) {
                if (words[i + 2] !== Syntax.WHERE)
                    syntaxError(commandIndex, utils.countMistakeIndex(words, i + 2));
                if (words[i + 3] !== Syntax.EXIST)
                    syntaxError(commandIndex, utils.countMistakeIndex(words, i + 3));
                entryData = words.slice(i + 4).join(Syntax.SPACE);
                break;
            } else
                syntaxError(commandIndex, utils.countMistakeIndex(words, i + 1));
            wasBridgingBefore = false;
        }
        return [entryData, fieldsSequence];
    },

    isField: (type) => {
        return [Syntax.PHONES, Syntax.EMAILS, Syntax.NAME].includes(type);
    },

};

const handlers = {
    handleCreateCommand: (words) => {
        if (commands.createContact.isThisCommand(words)) {
            commands.createContact.run(words.slice(2).join(Syntax.SPACE));
            return true;
        }
        return false;
    },

    handleDeleteCommand: (words, queries, commandIndex) => {
        if (commands.deleteContact.isThisCommand(words)) {
            commands.deleteContact.run(words.slice(2).join(Syntax.SPACE));
            return true;
        }

        if (commands.deleteContactsEntry.isThisCommand(words)) {
            if (words[2] !== Syntax.WHERE)
                syntaxError(commandIndex, utils.countMistakeIndex(words, 2));
            if (words[3] !== Syntax.EXIST)
                syntaxError(commandIndex, utils.countMistakeIndex(words, 3));
            commands.deleteContactsEntry.run(words.slice(4).join(Syntax.SPACE));
            return true;
        }

        if (commands.deleteFields.isThisCommand(words)) {
            let [name, phones, emails] = utils.parseAddAndDeleteRequests(words, commandIndex);
            commands.deleteFields.run(name, phones, emails);
            return true;
        }
        return false
    },

    handleAddCommand: (words, queries, commandIndex) => {
        if (!commands.addPhonesAndEmails.isThisCommand(words))
            return false;

        let [name, phones, emails] = utils.parseAddAndDeleteRequests(words, commandIndex);
        commands.addPhonesAndEmails.run(name, phones, emails);
        return true;
    },

    handleShowCommand: (words, queries, commandIndex) => {
        if (!commands.showEntryInfo.isThisCommand(words))
            return false;

        let [entryData, fieldsSequence] = utils.parseShowRequests(words, commandIndex);
        return commands.showEntryInfo.run(entryData, fieldsSequence);
    },

    handleCommands: (commandWords, queries, commandIndex, result) => {
        switch (commandWords[0]) {
            case CommandsSyntax.CREATE:
                !handlers.handleCreateCommand(commandWords)
                && syntaxError(commandIndex, utils.countMistakeIndex(commandWords, 1));
                break;
            case CommandsSyntax.DELETE:
                !handlers.handleDeleteCommand(commandWords, queries, commandIndex)
                && syntaxError(commandIndex, utils.countMistakeIndex(commandWords, 1));
                break;
            case CommandsSyntax.ADD:
                !handlers.handleAddCommand(commandWords, queries, commandIndex)
                && syntaxError(commandIndex, utils.countMistakeIndex(commandWords, 1));
                break;
            case CommandsSyntax.SHOW:
                let dataToShow = handlers.handleShowCommand(commandWords, queries, commandIndex);
                if (!dataToShow)
                    syntaxError(commandIndex, utils.countMistakeIndex(commandWords, 1));
                result.push(dataToShow);
                break;
            default:
                syntaxError(commandIndex, 1);
        }
    },

};

/**
 * Вызывайте эту функцию, если есть синтаксическая ошибка в запросе
 * @param {number} lineNumber – номер строки с ошибкой
 * @param {number} charNumber – номер символа, с которого запрос стал ошибочным
 */
function syntaxError(lineNumber, charNumber) {
    throw new Error(`SyntaxError: Unexpected token at ${lineNumber}:${charNumber}`);
}

function checkEndError(queries) {
    let lastCharIndex = queries[queries.length - 1].length + 1;
    if (queries[queries.length - 1] !== SyntaxErrors.EMPTY_STRING)
        syntaxError(queries.length, lastCharIndex);
}

/**
 * Выполнение запроса на языке pbQL
 * @param {string} query
 * @returns {string[]} - строки с результатами запроса
 */
function run(query) {
    let queries = query.split(Syntax.END);
    let result = [];
    let commandIndex = 1;

    for (let fullCommand of queries) {
        if (fullCommand === SyntaxErrors.EMPTY_STRING) {
            if (commandIndex === queries.length)
                break;
            syntaxError(commandIndex, 1);
        }

        let commandWords = fullCommand.split(Syntax.SPACE);
        handlers.handleCommands(commandWords, queries, commandIndex, result);
        commandIndex++;
    }
    checkEndError(queries);
    return result.flat();
}

module.exports = {phoneBook, run};

console.log(run('Создай контакт Григорий;' +
    'Создай контакт Гр;' +
    'Добавь телефон 5556667788 и телефон 5556667787 и почту grisha@example.com для контакта Григорий;' +
    'Удали почту grisha@example.com для контакта Григорий;' +
    'Покажи имя и имя и почты и телефоны и телефоны для контактов, где есть Гр;'
));
console.log(phoneBook);