import crypto from 'crypto';
import { fetchPrices,convertCryptoToUSD } from './utils/priceFetcher.js';
import User from './models/User.js';
import Transaction from './models/Transaction.js';

//Game config
const ROUND_INTERVAL = 10000; // 10 sec
const MULTIPLIER_INTERVAL = 100; // 100ms
const MAX_MULTIPLIER = 120;

let roundNumber = 1;
let currentRound = null;


let players = {}; // { socketId: { username, crypto, cryptoAmount } }
let crashPoint = 0;
let multiplier = 1;
let gameInProgress = false;

export function generateCrashPoint(seed, round) {
  const hash = crypto.createHash('sha256').update(seed + round).digest('hex');
  const num = parseInt(hash.substring(0, 8), 16);
  return Math.min((num % 10000) / 100 + 1, MAX_MULTIPLIER); // e.g., 1.00 to 101.00
}

export function startGame(io) {
  setInterval(() => {
    if (gameInProgress) return;

    const seed = crypto.randomBytes(16).toString('hex');
    crashPoint = generateCrashPoint(seed, roundNumber);
    multiplier = 1;
    gameInProgress = true;

    currentRound = {
      roundNumber,
      seed,
      crashPoint,
      startTime: Date.now()
    };

    io.emit('roundStart', {
      roundNumber,
      seedHash: crypto.createHash('sha256').update(seed).digest('hex')
    });

    let interval = setInterval(() => {
      multiplier += 0.01 * multiplier; // Exponential growth
      multiplier = parseFloat(multiplier.toFixed(2));

      io.emit('multiplierUpdate', { multiplier });

      if (multiplier >= crashPoint) {
        clearInterval(interval);
        io.emit('roundCrash', { crashPoint });
        players = {};
        gameInProgress = false;
        roundNumber += 1;
      }
    }, MULTIPLIER_INTERVAL);

  }, ROUND_INTERVAL);
}

export function registerPlayer(socket, betData) {
  players[socket.id] = betData;
}

export async function cashOut(socket, io) {
    // console.log("in cashout");
  const player = players[socket.id];
  if (!player) return;

  if (!gameInProgress || multiplier >= crashPoint) {
    socket.emit('cashoutFailed', { reason: 'Too late or round crashed' });
    return;
  }

  try {
    const prices = await fetchPrices();
    const cryptoPayout = parseFloat((player.cryptoAmount * multiplier).toFixed(8));
    const usdPayout = convertCryptoToUSD(cryptoPayout, player.crypto, prices);

    const user = await User.findOne({ username: player.username });
    if (!user) return;

    user.wallet[player.crypto] += cryptoPayout;
    await user.save();

    const txn = new Transaction({
      playerId: user._id,
      transactionType: 'cashout',
      crypto: player.crypto,
      cryptoAmount: cryptoPayout,
      usdAmount: usdPayout,
      priceAtTime: prices[player.crypto],
      transactionHash: 'tx_' + Math.random().toString(36).substring(2, 10)
    });
    await txn.save();

    io.emit('playerCashout', {
      username: player.username,
      multiplier,
      crypto:player.crypto,
      cryptoAmount: cryptoPayout,
      usdAmount: usdPayout
    });

    delete players[socket.id]; // prevent multiple cashouts
  } catch (err) {
    console.error("💥 Cashout error:", err);
    socket.emit('cashoutFailed', { reason: 'Server error' });
  }
}


