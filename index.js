const DiceGame = require('./DiceGame');

// arguments processing
function parseDiceArgs(args) {
    try {
        return args.map(arg => arg.split(',').map(Number));
    } catch (error) {
        console.error("Error parsing dice configurations.");
        process.exit(1);
    }
}

// receiving and checking arguments
const diceArgs = process.argv.slice(2);
if (diceArgs.length < 3) {
    console.log("You must provide at least three dice.");
    process.exit(1);
}

try {
    const diceConfigs = parseDiceArgs(diceArgs);
    const game = new DiceGame(diceConfigs);
    game.play();
} catch (error) {
    console.error(error.message);
    console.log("Example of correct usage: node index.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
}
