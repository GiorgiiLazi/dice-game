class Dice {
    constructor(values) {
        if (values.length !== 6 || values.some(isNaN)) {
            throw new Error("Each dice must have exactly 6 integer values.");
        }
        this.values = values;
    }
    roll() {
        const index = Math.floor(Math.random() * this.values.length);
        return this.values[index];
    }
}

module.exports = Dice;
