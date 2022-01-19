let fs = require("fs");
let axios = require("axios");

const API_KEY = process.env.MORALIS_API_KEY;
let ipfsArray = [];
let promises = [];

// Change "100" according to number of pictures!!! Get number of item uploaded to adjust dynamically
// Loop to create json file prior to sending to ipfs
for (let i = 0; i < 100; i++) {
    let paddedHex = ("0000000000000000000000000000000000000000000000000000000000000000" + i.toString(16)).substr("-64");
    
    promises.push(new Promise( (res, rej) => {
        fs.readFile(`${__dirname}/export/${paddedHex}.png`, (err, data) => {
            if(err) rej();
            ipfsArray.push({
                path: `images/${paddedHex}.png`,
                content: data.toString("base64")
            })
            res();
        })
    }))
}
Promise.all(promises).then( () => {
    axios.post("https://deep-index.moralis.io/api/v2/ipfs/uploadFolder", 
        ipfsArray,
        {
            headers: {
                //"X-API-KEY": 'REtwfgnP81YBSFRpqrXiTdoqyFXXLC4jubxYUq9QYIPCXvirTuDk6iulYQ6GN88G', // Paste API Key (import from .env)
                "X-API-KEY": API_KEY.toString(),
                "Content-Type": "application/json",
                "accept": "application/json"
            }
        }
    ).then( (res) => {
        console.log(res.data);
    })
    .catch ( (error) => {
        console.log(error)
    })
})