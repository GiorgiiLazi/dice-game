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
        const x = Math.floor(Math.random() * Math.min(6, this.diceSet.length)); // Ограничиваем диапазон числом кубиков
        console.log(`Computer's secret number (x): ${x}`);
    
        //step 2: secret key generation
        const secretKey = crypto.randomBytes(16).toString('hex');
    
        //step 3: HMAC(x) calculation
        const hmac = crypto.createHmac('sha256', secretKey).update(x.toString()).digest('hex');
        console.log(`HMAC of the computer's number: ${hmac}`);
    
        //step 4: user chosese y number
        const y = await this.getUserChoice();
    
        //step 5: result calculation
        const result = (x + y) % Math.min(6, this.diceSet.length); // using dice
    
        //step 6: show result and secret key
        console.log(`Result (x + y) % ${Math.min(6, this.diceSet.length)}: ${result}`);
        console.log(`Secret key: ${secretKey}`);
    
        return result;
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
    
        // calculating index
        const diceIndex = await this.collaborativeRandomNumber();
    
        // checking index
        if (diceIndex >= this.diceSet.length || diceIndex < 0) {
            console.log(`Invalid dice index generated: ${diceIndex}`);
            console.log("Please ensure there are enough dice configurations provided.");
            return;
        }
    
        // choosing dice
        const userDice = this.diceSet[diceIndex];
        console.log("Your selected dice:");
        this.displayDiceTable([userDice]);
    
        // user throw
        const userRoll = this.user.takeTurn(userDice);
    
        // computer chooses and throws
        const computerDice = this.diceSet[Math.floor(Math.random() * this.diceSet.length)];
        console.log("Computer selected dice:");
        this.displayDiceTable([computerDice]);
    
        const computerRoll = this.computer.takeTurn(computerDice);
    
        // select the winner
        this.determineWinner(userRoll, computerRoll);
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
