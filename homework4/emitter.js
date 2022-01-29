"use strict"

function getEmitter() {
    const events = {};

    const addEvent = (event, context, handler, times = Infinity, frequency = 1) => {
        if (!(event in events))
            events[event] = [];
        handler = handler.bind(context);
        events[event].push({context, handler, times: times, frequency: frequency, "calls": 0});
    }

    return {
        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         */
        on: function (event, context, handler) {
            addEvent(event, context, handler);
            // console.log(event, context, handler, 'add');
            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         */
        off: function (event, context) {
            let eventsNames = [...Object.keys(events)];

            let eventsToDelete = eventsNames.filter(x => x.startsWith(event + '.'));
            if (event in events)
                eventsToDelete.push(event);

            for (let eventName of eventsToDelete) {
                let newEventObjects = [];
                for (let eventObject of events[eventName]) {
                    if (eventObject.context !== context)
                        newEventObjects.push(eventObject);
                }
                events[eventName] = newEventObjects;
            }
            // console.info(event, context, 'off');
            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         */
        emit: function (event) {
            let eventsToEmit = event.split('.')
                .reduceRight((acc, _, index, arr) =>
                    acc.concat(arr.slice(0, index + 1).join('.')), [])
                .filter(event => event in events);

            for (let event of eventsToEmit) {
                for (let eventObject of events[event]) {
                    if (eventObject.calls < eventObject.times
                        && eventObject.calls % eventObject.frequency === 0)
                        eventObject.handler.call();
                    eventObject.calls++;
                }
            }
            // console.info(event, 'emit');
            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         */
        several: function (event, context, handler, times) {
            if (times <= 0)
                return this.on(event, context, handler);
            addEvent(event, context, handler, times);
            // console.info(event, context, handler, times, 'several');
            return this;
        },

        through: function (event, context, handler, frequency) {
            if (frequency <= 0)
                return this.on(event, context, handler);
            addEvent(event, context, handler, Infinity, frequency);
            // console.info(event, context, handler, frequency, 'through');
            return this;
        }
    };
}

const isStar = true;

module.exports = {
    getEmitter,
    isStar
};