import axios from "axios";

let cachedPrice = null;
let lastFetchTime = 0;
const CATCH_DURATION = 10 * 1000;

export const fetchPrices = async () => {
    const now = Date.now();
    if(cachedPrice && (lastFetchTime - now) < CATCH_DURATION){
        return cachedPrice;
    }

    try{
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price',{
            params:{
                ids: 'bitcoin,ethereum',
                vs_currencies: 'usd'
            }
        });

        cachedPrice = {
            BTC: res.data.bitcoin.usd,
            ETH: res.data.ethereum.usd
        }

        lastFetchTime = Date.now();

        return cachedPrice;
    } catch(err){
        console.log("Error in Fetch Prieces",err);
    }
}

export const convertUSDToCrytpo = (usdAmount,currency,prices) => {
    if(!prices[currency]) throw new Error("Invalid Currency")
    return usdAmount / prices[currency];
}

export const convertCryptoToUSD = (cryptoAmount,currency,prices) => {
    if(!prices[currency]) throw new Error("Ivalid Crypto");
    return cryptoAmount * prices[currency];
}
