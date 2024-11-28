const crypto = require('crypto');
const readline = require('readline');
const AsciiTable = require('ascii-table');
const Player = require('./Player');
const Dice = require('./Dice');

class DiceGame {
    constructor(diceConfigs) {
        this.diceSet = diceConfigs.map(config => new Dice(config));
        this.user = new Player('User');
        this.computer = new Player('Computer');
    }

    async collaborativeRandomNumber() {
        console.log("=== Collaborative Random Number Generation ===");
    
        // step 1: computer generates random number x
        const x = Math.floor(Math.random() * Math.min(6, this.diceSet.length));
    
        // step 2: secret key generation
        const secretKey = crypto.randomBytes(16).toString('hex');
    
        // step 3: HMAC(x) calculation
        const hmac = crypto.createHmac('sha256', secretKey).update(x.toString()).digest('hex');
        // HMAC больше не выводится в консоль.
    
        // step 4: user chooses y number
        const y = await this.getUserChoice();
    
        // step 5: result calculation
        const result = (x + y) % Math.min(6, this.diceSet.length);
    
        // step 6: return result
        return { result, secretKey };
    }

    async getUserChoice() {
        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.question("Select a number (0-5): ", (input) => {
                const choice = parseInt(input);
                if (isNaN(choice) || choice < 0 || choice > 5) {
                    console.log("Invalid choice. Please select a number between 0 and 5.");
                    rl.close();
                    resolve(this.getUserChoice());
                } else {
                    rl.close();
                    resolve(choice);
                }
            });
        });
    }

    async play() {
        console.log("=== Welcome to the Generalized Dice Game ===");
    
        // calculating index and determining who selects first
        const { result: diceIndex, secretKey } = await this.collaborativeRandomNumber();
    
        if (diceIndex >= this.diceSet.length || diceIndex < 0) {
            console.log(`Invalid dice index generated: ${diceIndex}`);
            console.log("Please ensure there are enough dice configurations provided.");
            return;
        }
    
        // Choosing who selects first
        const firstPicker = diceIndex % 2 === 0 ? this.user : this.computer;
        console.log(`${firstPicker.name} will select the dice first.`);
    
        let userDice, computerDice;

        if (firstPicker === this.user) {
            userDice = await this.selectDice();
            console.log("Computer is choosing...");
            computerDice = this.randomRemainingDice(userDice);
        } else {
            computerDice = this.randomDice();
            console.log("Computer selected dice:");
            this.displayDiceTable([computerDice]);
            userDice = await this.selectDice(computerDice);
        }
    
        console.log("Your selected dice:");
        this.displayDiceTable([userDice]);
    
        // Rolls
        const userRoll = this.user.takeTurn(userDice);
        const computerRoll = this.computer.takeTurn(computerDice);
    
        // Select the winner
        this.determineWinner(userRoll, computerRoll);
    }

    async selectDice(excludedDice = null) {
        console.log("Available dice:");
        const availableDice = this.diceSet.filter(dice => dice !== excludedDice);
        this.displayDiceTable(availableDice);

        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.question("Select a dice index: ", (input) => {
                const choice = parseInt(input) - 1; // Adjusting for 0-based index
                if (isNaN(choice) || choice < 0 || choice >= availableDice.length) {
                    console.log("Invalid choice. Please select a valid dice index.");
                    rl.close();
                    resolve(this.selectDice(excludedDice));
                } else {
                    rl.close();
                    resolve(availableDice[choice]);
                }
            });
        });
    }

    randomDice() {
        const index = Math.floor(Math.random() * this.diceSet.length);
        return this.diceSet[index];
    }

    randomRemainingDice(excludedDice) {
        const remainingDice = this.diceSet.filter(dice => dice !== excludedDice);
        const index = Math.floor(Math.random() * remainingDice.length);
        return remainingDice[index];
    }

    displayDiceTable(diceArray) {
        const table = new AsciiTable('Dice Faces');
        table.setHeading('Index', 'Values');
        diceArray.forEach((dice, index) => {
            table.addRow(index + 1, dice.values.join(', '));
        });
        console.log(table.toString());
    }

    determineWinner(userRoll, computerRoll) {
        console.log(`Final rolls: You - ${userRoll}, Computer - ${computerRoll}`);
        if (userRoll > computerRoll) {
            console.log("You win!");
        } else if (userRoll < computerRoll) {
            console.log("Computer wins!");
        } else {
            console.log("It's a tie!");
        }
    }
}

module.exports = DiceGame;
