'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    this.invitedFriends = [];
    this.iteratorPosition = 0;

    let lexicographicOrder = (a, b) => a.name.localeCompare(b.name);

    friends = friends.sort(lexicographicOrder);
    let possibleFriends = friends.filter(x => x.best);

    let maxLevel = Infinity;
    if (typeof this.maxLevel !== "undefined")
        maxLevel = this.maxLevel;

    for (let currentLevel = 1; currentLevel <= maxLevel; currentLevel++) {
        if (possibleFriends.length === 0)
            break;
        this.invitedFriends.push(...possibleFriends);

        let friendsOfFriendsNames = [];
        possibleFriends.forEach(x => {
            friendsOfFriendsNames.push(...x.friends);
        })

        let _possibleFriends = [];
        for (let friend of friends) {
            for (let possibleFriendName of friendsOfFriendsNames) {
                if (friend.name === possibleFriendName
                    && this.invitedFriends.filter(x =>
                        x.name === possibleFriendName).length === 0) {
                    _possibleFriends.push(friend);
                    break;
                }
            }
        }
        possibleFriends = _possibleFriends.sort(lexicographicOrder)
    }
    this.invitedFriends = this.invitedFriends.filter(x => filter.employ(x));
}

Object.assign(Iterator.prototype, {
    done: function () {
        return this.iteratorPosition === this.invitedFriends.length;
    },

    next: function () {
        return this.done()
            ? null
            : this.invitedFriends[this.iteratorPosition++];
    }
})

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this.maxLevel = maxLevel;
    Iterator.apply(this, arguments);
}
LimitedIterator.prototype =  Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.employ = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.employ = x => x.gender === 'male';
}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.employ = x => x.gender === 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
