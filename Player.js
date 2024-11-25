class Player {
    constructor(name) {
        this.name = name;
    }
    takeTurn(dice) {
        const roll = dice.roll();
        console.log(`${this.name} rolled a ${roll}`);
        return roll;
    }
}

module.exports = Player;
