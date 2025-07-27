import { Router } from "express";
import User from '../models/User.js';
import { convertCryptoToUSD, convertUSDToCrytpo, fetchPrices } from "../utils/priceFetcher.js";
import Transaction from '../models/Transaction.js'

const router = Router();

router.get("/",(req,res) => {
    res.send("Online Crypto game");
})

router.post("/api/create-user",async (req,res) => {
    try{
        const { username } = req.body;

        const existing = await User.findOne({ username });
        if(existing){
            res.status(403).json({ message:'user already exists' });
            return;
        }

        const user = new User({ username });
        await user.save()
        console.log("user",user);
        res.status(200).json({ message:'User Created Successfully', user })

    } catch(err){
        console.log("Error in Create User",err);
        res.status(500).json({ error:err.message });
    }
})

router.get('/api/wallet/:username',async (req,res) => {
    try{
        const { username } = req.params;
        const user = await User.findOne({ username });
        if(!user){
            res.status(404).json({ error:"User not found" });
            return; 
        }
        res.status(200).json({ 
            BTC: user.wallet.BTC,
            ETH: user.wallet.ETH 
        })

    } catch(err) {
        console.log("Error in Get Wallet",err);
        res.status(500).json({ error:err.message });
    }
})

router.get('/api/prices',async (req,res) => {
    try{
        const prices = await fetchPrices();
        res.json(prices);
    } catch(err) {
        console.log("Error in Getting price",err);
    }
})

router.post('/api/bet',async (req,res) => {
    try{
        const { username,usdAmount,crypto } = req.body;

        if(!usdAmount || usdAmount <= 0){
            res.status(400).json({ error:"Invalid USD Amount" });
            return
        } 
        if(!['BTC','ETH'].includes(crypto)){
            res.status(400).json({ error:"Invalid Crypto Type" });
            return
        }

        const user = await User.findOne({ username });
        if(!user) {
            res.status(404).json({ error:'User Not Found' });
            return
        }

        const prices =  await fetchPrices(); 
        const cryptoAmount = convertUSDToCrytpo(usdAmount, crypto, prices);
        console.log("The crypot amout is ",cryptoAmount);
        console.log("The value is",user.wallet[crypto]);

        if(user.wallet[crypto] < cryptoAmount){
            res.status(400).json({ error:'Insufficient Balance' });
            return
        }

        user.wallet[crypto] -= cryptoAmount;
        await user.save();

        const transactionHash = 'tx_' + Math.random().toString(36).substr(2, 9);

        const txn = new Transaction({
        playerId: user._id,
        transactionType: 'bet',
        crypto,
        usdAmount,
        cryptoAmount,
        priceAtTime: prices[crypto],
        transactionHash
        });

        await txn.save();

        res.json({
        message: "Bet placed successfully",
        username,
        usdAmount,
        cryptoAmount,
        crypto,
        transactionHash
    });

    } catch(err){
        console.log("Error in placing bet",err);
        res.status(200).json({ message:err.message });
    }
})



export default router;