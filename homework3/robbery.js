'use strict';

const isExtraTaskSolved = true;

const AVAILABLE_DAYS = {
    MONDAY: 'ПН',
    TUESDAY: 'ВТ',
    WEDNESDAY: 'СР',
}

const DAY_TO_NUMBER = {
    [AVAILABLE_DAYS.MONDAY]: 0,
    [AVAILABLE_DAYS.TUESDAY]: 1,
    [AVAILABLE_DAYS.WEDNESDAY]: 2,
};

const NUMBER_TO_DAY = {
    0: [AVAILABLE_DAYS.MONDAY],
    1: [AVAILABLE_DAYS.TUESDAY],
    2: [AVAILABLE_DAYS.WEDNESDAY],
};

const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const TIME_REGEXP = /^(\W+) (\d{2}):(\d{2})\+(\d+)$/;

let BANK_TIME_ZONE;

class MinutesInterval {
    constructor(from, to, day) {
        if (typeof day !== "undefined") {
            // for bankTime
            this.from = this.workingTimeToMinutes(from, day);
            this.to = this.workingTimeToMinutes(to, day);
        } else if (typeof from === "string" && typeof to === "string") {
            // for schedule
            this.from = this.timeToMinutes(from);
            this.to = this.timeToMinutes(to, day);
        } else if (typeof from === "number" && typeof to === "number") {
            // for minutes
            this.from = from;
            this.to = to;
        }
    }

    timeToMinutes(time) {
        let rawValues = time.match(TIME_REGEXP).slice(1);

        let day = rawValues[0];
        let [hours, minutes, timeZone] = rawValues.slice(1).map(x => parseInt(x));

        return this.getMinutes(day, hours, minutes, timeZone);
    }

    workingTimeToMinutes(time, day) {
        let [hours, minutes] = time.split(':').map(x => parseInt(x.slice(0, 2)));
        return this.getMinutes(day, hours, minutes, BANK_TIME_ZONE);
    }

    getMinutes(day, hours, minutes, timeZone) {
        minutes += (hours - timeZone + BANK_TIME_ZONE) * MINUTES_IN_HOUR
        minutes += HOURS_IN_DAY * MINUTES_IN_HOUR * DAY_TO_NUMBER[day]
        return minutes
    }
}

function getBankIntervals(workingHours) {
    let bankIntervals = [];
    for (let day in AVAILABLE_DAYS)
        bankIntervals.push(new MinutesInterval(workingHours.from, workingHours.to, AVAILABLE_DAYS[day]));

    return bankIntervals;
}

function isIntersected(interval, otherInterval) {
    return interval.to >= otherInterval.from && otherInterval.to >= interval.from;
}

function mergeIntervals(intervals) {
    const unitedIntervals = [intervals[0]];
    let lastInterval = unitedIntervals[unitedIntervals.length - 1];

    for (let interval of intervals) {
        if (isIntersected(interval, lastInterval))
            lastInterval.to = Math.max(lastInterval.to, interval.to);
        else {
            unitedIntervals.push(interval);
            lastInterval = interval;
        }
    }

    return unitedIntervals;
}

function getGangBusyIntervals(schedule) {
    let gangIntervals = [];
    for (let robber in schedule) {
        for (let freeHours of schedule[robber]) {
            let interval = new MinutesInterval(freeHours.from, freeHours.to);
            gangIntervals.push(interval);
        }
    }
    return mergeIntervals(gangIntervals.sort((a, b) => a.from - b.from));
}

function getGangFreeIntervals(gangBusyIntervals) {
    let startTime = 0;
    let lastTime = (MINUTES_IN_HOUR - 1)
        + (HOURS_IN_DAY - 1) * MINUTES_IN_HOUR
        + HOURS_IN_DAY * MINUTES_IN_HOUR * DAY_TO_NUMBER[AVAILABLE_DAYS.WEDNESDAY]

    let gangFreeIntervals = []
    for (let interval of gangBusyIntervals) {
        gangFreeIntervals.push(new MinutesInterval(startTime,
            interval.from < lastTime ? interval.from : lastTime))
        startTime = interval.to;
    }
    if (startTime < lastTime)
        gangFreeIntervals.push(new MinutesInterval(startTime, lastTime))

    return gangFreeIntervals;
}

function getRobberyIntervals(schedule, bankIntervals, duration) {
    let gangBusyIntervals = getGangBusyIntervals(schedule);
    let gangFreeIntervals = getGangFreeIntervals(gangBusyIntervals);
    let robberyIntervals = [];

    for (let bankInterval of bankIntervals) {
        for (let gangInterval of gangFreeIntervals) {
            if (isIntersected(bankInterval, gangInterval)) {
                let interval = new MinutesInterval(
                    Math.max(bankInterval.from, gangInterval.from),
                    Math.min(bankInterval.to, gangInterval.to));
                if (interval.to - interval.from >= duration)
                    robberyIntervals.push(interval);
            }
        }
    }
    return robberyIntervals;
}

/**
 * @param {Object} schedule Расписание Банды
 * @param {number} duration Время на ограбление в минутах
 * @param {Object} workingHours Время работы банка
 * @param {string} workingHours.from Время открытия, например, "10:00+5"
 * @param {string} workingHours.to Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
function getAppropriateMoment(schedule, duration, workingHours) {
    BANK_TIME_ZONE = parseInt(workingHours.from.slice(6));

    let bankIntervals = getBankIntervals(workingHours);
    let robberyIntervals = getRobberyIntervals(schedule, bankIntervals, duration);

    return {
        /**
         * Найдено ли время
         * @returns {boolean}
         */
        exists() {
            return robberyIntervals.length > 0;
        },

        /**
         * Возвращает отформатированную строку с часами
         * для ограбления во временной зоне банка
         *
         * @param {string} template
         * @returns {string}
         *
         * @example
         * ```js
         * getAppropriateMoment(...).format('Начинаем в %HH:%MM (%DD)') // => Начинаем в 14:59 (СР)
         * ```
         */
        format(template) {
            if (!this.exists())
                return '';

            const convertTime = (num) => num.toString().padStart(2, '0');
            let robberyTime = robberyIntervals[0].from;
            let dayNumber = Math.floor(robberyTime / (HOURS_IN_DAY * MINUTES_IN_HOUR))

            let dayName = NUMBER_TO_DAY[dayNumber];
            let hours = Math.floor((robberyTime - dayNumber * HOURS_IN_DAY * MINUTES_IN_HOUR) / MINUTES_IN_HOUR);
            let minutes = (robberyTime - dayNumber * HOURS_IN_DAY * MINUTES_IN_HOUR - hours * MINUTES_IN_HOUR);

            return template
                .replace('%DD', dayName)
                .replace('%HH', convertTime(hours))
                .replace('%MM', convertTime(minutes));
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @note Не забудь при реализации выставить флаг `isExtraTaskSolved`
         * @returns {boolean}
         */
        tryLater() {
            if (!this.exists())
                return false;

            const minutesShift = 30;
            let nearestRobberyInterval = robberyIntervals[0];

            if (nearestRobberyInterval.to - (nearestRobberyInterval.from + minutesShift) >= duration) {
                nearestRobberyInterval.from += minutesShift;
                return true;
            } else if (typeof robberyIntervals[1] !== "undefined") {
                robberyIntervals.shift();
                return true;
            }
            return false;
        }
    };
}

module.exports = {
    getAppropriateMoment,
    isExtraTaskSolved
};

const gangSchedule = {
    Danny: [{from: 'ПН 12:00+5', to: 'ПН 17:00+5'}, {from: 'ВТ 13:00+5', to: 'ВТ 16:00+5'}],
    Rusty: [{from: 'ПН 11:30+5', to: 'ПН 16:30+5'}, {from: 'ВТ 13:00+5', to: 'ВТ 16:00+5'}],
    Linus: [
        {from: 'ПН 09:00+3', to: 'ПН 14:00+3'},
        {from: 'ПН 21:00+3', to: 'ВТ 09:30+3'},
        {from: 'СР 09:30+3', to: 'СР 15:00+3'}
    ]
};

const bankWorkingHours = {
    from: '10:00+5',
    to: '18:00+5'
};

// Время не существует
const longMoment = getAppropriateMoment(gangSchedule, 121, bankWorkingHours);

// Выведется `false` и `""`
console.info(longMoment.exists());
console.info(longMoment.format('Метим на %DD, старт в %HH:%MM!'));

// Время существует
const moment = getAppropriateMoment(gangSchedule, 90, bankWorkingHours);

// Выведется `true` и `"Метим на ВТ, старт в 11:30!"`
console.info(moment.exists());
console.info(moment.format('Метим на %DD, старт в %HH:%MM!'));
 