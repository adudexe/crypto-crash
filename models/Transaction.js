import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionType: { type: String, enum: ['bet', 'cashout'], required: true },
  crypto: { type: String, enum: ['BTC', 'ETH'], required: true },
  usdAmount: Number,
  cryptoAmount: Number,
  priceAtTime: Number,
  transactionHash: String, // mock hash
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema)