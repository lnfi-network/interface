import axios from "axios";

const blockstream = new axios.Axios({
    baseURL: `https://mempool.space/`
});

export const waitUntilUTXO = async function (address, network) {
    console.log(`Waiting for UTXO on network ${network}`);
    return new Promise((resolve, reject) => {
        let intervalId;
        const checkForUtxo = async () => {
            try {
                const response = await blockstream.get(`${network}/api/address/${address}/utxo`);
                const data = response.data ? JSON.parse(response.data) : undefined;
                // console.log(data);
                if (data.length > 0) {
                    resolve(data);
                    clearInterval(intervalId);
                }
            } catch (error) {
                reject(error);
                clearInterval(intervalId);
            }
        };
        intervalId = setInterval(checkForUtxo, 5000);
    });
}

export const getTx = async function (txid) {
    return new Promise((resolve, reject) => {

        const checkForUtxo = async () => {
            try {
                const response = await blockstream.get(`/tx/${txid}`);
                const data = response.data ? JSON.parse(response.data) : undefined;
                console.log(data);
                if (data.length > 0) {
                    resolve(data);

                }
            } catch (error) {
                reject(error);

            }
        };
        checkForUtxo();
        // intervalId = setInterval(checkForUtxo, 5000);
    });
}

export const broadcast = async function (txHex, network) {
    const response = await blockstream.post(`${network}/api/tx`, txHex);
    return response.data;
}


