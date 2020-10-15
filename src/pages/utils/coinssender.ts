import { HDNode, TransactionBuilder } from 'bitcoinjs-lib';
import { mnemonicToSeed } from 'bip39';
import { Console } from './console';
import { Constants } from './constants';
import Web3 from 'web3';

export class CoinsSender {

    static sendCoinsXnd(data, successCall, errorCall) {
        let amount = data['amount'];
        let userCode = data['userCode'];
        let sellerCode = data['sellerCode'];
        let loading = data['loading'];
        let loadingCtrl = data['loadingCtrl'];
        let toastCtrl = data['toastCtrl'];
        let http = data['http'];
        let password = data['password'];

        loading = Constants.showLoading(loading, loadingCtrl, "Please Wait...");


        let url = Constants.SEND_TOKEN_URL;

        let requestData = {
            password: password,
            btcValue: amount,
            userCode: userCode,
            sellerCode: sellerCode,
            //product: product,
        };

        http.post(url, requestData, Constants.getWalletHeader("NGNC")).map(res => res.json()).subscribe(responseData => {
            loading.dismiss();
            Console.log(responseData);
            if(responseData.response_text === 'error') {
              Constants.showLongerToastMessage(responseData.result, toastCtrl);
              errorCall(data);
              return;
            }

            if (responseData.response_text === 'success') {
                Constants.showLongerToastMessage("Transaction Successful.", toastCtrl);
                successCall(data);
                return;
            }
        }, error => {
            loading.dismiss();
            errorCall(data);
            Constants.showLongerToastMessage(error, toastCtrl);
        });
    }

    //static sendCoinsEth(data, amount, recipientAddress, password) {
    static async sendCoinsEth(data, successCall, errorCall, coin) {
        let amount = data['amount'];
        let recipientAddress = data['recipientAddress'];
        let loading = data['loading'];
        let loadingCtrl = data['loadingCtrl'];
        let ls = data['ls'];
        let toastCtrl = data['toastCtrl'];
        //let http = data['http'];
        //let password = ls.getItem('password');

        loading = Constants.showLoading(loading, loadingCtrl, "Please Wait...");

        let mnemonicCode = await Constants.normalizeMnemonicCode(ls);

        let privateKey = await ls.getItem('ETHPrivateKey');

        let fees = Constants.getWalletProperties(coin);

        let web3 = new Web3(new Web3.providers.HttpProvider(Constants.GETH_PROXY));

        var contractAddress = fees.contract;
        var xendContract = web3.eth.contract(Constants.ABI);
        var instance = xendContract.at(contractAddress);

        let key = coin + "Address";
        let sender = await ls.getItem(key);


        try {
            web3.personal.importRawKey(privateKey, mnemonicCode);
        } catch (e) {
            //Console.log(e);
        }

        try {
            web3.personal.unlockAccount(sender, mnemonicCode);
        } catch (e) {
            errorCall(data);
            loading.dismiss();
            Constants.showLongerToastMessage("An error occurred sending your ether", toastCtrl);
            return;
        }

        let val = +amount * +fees.multiplier
        let xendFees = (+amount * +fees.xendFees) * +fees.multiplier

        try {
            instance.send(recipientAddress, xendFees, { value: val, from: sender }, function (err, result) {
                if (err) {
                    errorCall(data);
                    loading.dismiss();
                    Constants.showLongerToastMessage("An error occurred sending your ether", toastCtrl);
                }

                if (result) {
                    successCall(data);
                    loading.dismiss();
                    web3.personal.lockAccount(sender, mnemonicCode);
                    Constants.showLongerToastMessage("Transaction Successful. The coins have been transfered.", toastCtrl);
                }
            });
        } catch (e) {
            errorCall(data);
            loading.dismiss();
            Constants.showLongerToastMessage("An error occurred sending your ether", toastCtrl);
        }
    }

    static show2FAAlert(data, successCall, errorCall, coin, fromAddress, network, alertCtrl, code) {
        let toastCtrl = data['toastCtrl'];
        const prompt = alertCtrl.create({
            title: 'Enter Code',
            message: "Please type the code sent to your email address to complete this transaction",
            inputs: [
                {
                    name: '2fa',
                    placeholder: '2 Factor Authentication'
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                    handler: data => {
                        Console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Confirm',
                    handler: alertData => {
                        Console.log(alertData['2fa']);
                        Console.log(code);
                        if(+alertData['2fa'] === code) {
                            this.continueSendingBTC(data, successCall, errorCall, coin, fromAddress, network);
                        } else {
                            Constants.showLongToastMessage("Wrong code entered. Please try again", toastCtrl);
                            this.show2FAAlert(data, successCall, errorCall, coin, fromAddress, network, data['alertCtrl'], code);
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    static async sendCoinsBtc(data, successCall, errorCall, coin, fromAddress, network) {
        Console.log("sendCoinsBtc");
        let ls = data['ls'];
        let http = data['http'];

        if (await ls.getItem('enable2FA')) {
            let url = Constants.SEND_2FA_CODE_URL;
            let postData = {
                emailAddress: await ls.getItem("emailAddress")
            };

            http.post(url, postData, Constants.getWalletHeader(coin)).map(res => res.json()).subscribe(responseData => {
                if (responseData.response_text === "success") {
                    let code = responseData.result;
                    this.show2FAAlert(data, successCall, errorCall, coin, fromAddress, network, data['alertCtrl'], code);
                }
            }, _error => { });
        } else {
            this.continueSendingBTC(data, successCall, errorCall, coin, fromAddress, network);
        }
    }


    static async continueSendingBTC(data, successCall, errorCall, coin, fromAddress, network) {
        let ls = data['ls'];
        let http = data['http'];
        let fees = Constants.getWalletProperties(coin);
        let amount: number = +data['amount'];
        let recipientAddress = data['recipientAddress'];
        let loading = data['loading'];
        let loadingCtrl = data['loadingCtrl'];
        let toastCtrl = data['toastCtrl'];
        let password = await ls.getItem('password');

        let xendFees = (amount * +fees.xendFees);
        let blockFees = +fees.blockFees / Constants.LAST_USD_RATE;

        loading = Constants.showLoading(loading, loadingCtrl, "Please Wait...");
        let url = Constants.GET_UNSPENT_OUTPUTS_URL + fromAddress;
        let amountToSend: number = amount + xendFees + blockFees;
        let postData = {
            btcValue: amountToSend
        };

        http.post(url, postData, Constants.getWalletHeader(coin)).map(res => res.json()).subscribe(responseData => {
            if (responseData.response_text === "error") {
                loading.dismiss();
                Constants.showLongerToastMessage(responseData.result, toastCtrl);
                errorCall(data);
            } else {
                let hex = CoinsSender.getTransactionHex(responseData, network, ls, amount, fees, xendFees, blockFees, recipientAddress, fromAddress);
                Console.log(hex);
                CoinsSender.submitTx(data, coin, hex, password, loading, successCall, errorCall);
            }
        }, _error => {
            loading.dismiss();
            Constants.showLongerToastMessage("Error getting your transactions", toastCtrl);
            errorCall(data);
        });
    }

    static getTransactionHex(responseData, network, ls, amount, fees, xendFees, blockFees, recipientAddress, fromAddress) {
        var hd = HDNode.fromSeedBuffer(mnemonicToSeed(ls.getItem('mnemonic').trim()), network).derivePath("m/0/0/0");
        var keyPair = hd.keyPair;
        var txb = new TransactionBuilder(network);
        var utxos = responseData.result;
        let sum = 0;
        for (let utxo of utxos) {
            txb.addInput(utxo['hash'], utxo['index']);
            sum = sum + +utxo['value'];
        }

        amount = Math.trunc(amount * +fees.multiplier);
        xendFees = Math.trunc(xendFees * +fees.multiplier);
        blockFees = Math.trunc(blockFees * +fees.multiplier);
        sum = Math.trunc(sum * +fees.multiplier);

        let change = Math.trunc(sum - amount - blockFees - xendFees);

        if (xendFees <= Constants.DUST) {
            change = Math.trunc(sum - amount - blockFees);
        }

        txb.addOutput(recipientAddress, amount);
        if (xendFees > Constants.DUST) {
            txb.addOutput(fees.xendAddress, xendFees);
        }

        if (change > Constants.DUST) {
            txb.addOutput(fromAddress, change);
        }

        let index = 0;
        for (let _utxo of utxos) {
            txb.sign(index, keyPair);
            index = index + 1;
        }

        let hex = txb.build().toHex();
        return hex;
    }

    static craftMultisig(data, successCall, errorCall, coin, fromAddress, network) {
        let ls = data['ls'];
        let http = data['http'];

        let fees = Constants.getWalletProperties(coin);

        let amount: number = +data['amount'];
        let recipientAddress = data['recipientAddress'];
        let loading = data['loading'];
        let loadingCtrl = data['loadingCtrl'];
        let toastCtrl = data['toastCtrl'];

        let xendFees = (amount * +fees.xendFees);
        let blockFees = +fees.blockFees / Constants.LAST_USD_RATE;

        loading = Constants.showLoading(loading, loadingCtrl, "Please Wait...");
        let url = Constants.GET_UNSPENT_OUTPUTS_URL + fromAddress;
        let amountToSend: number = amount + xendFees + +blockFees;
        let postData = {
            btcValue: amountToSend
        };

        http.post(url, postData, Constants.getWalletHeader(coin)).map(res => res.json()).subscribe(responseData => {
            loading.dismiss();
            if (responseData.response_text === "error") {
                Constants.showLongerToastMessage(responseData.result, toastCtrl);
                errorCall(data);
            } else {
                let hex = CoinsSender.getTransactionHex(responseData, network, ls, amount, fees, xendFees, blockFees, recipientAddress, fromAddress);
                data['trxHex'] = hex;
                successCall(data);
            }
        }, _error => {
            loading.dismiss();
            Constants.showLongerToastMessage("Error getting your transactions", toastCtrl);
            errorCall(data);
        });
    }

    static async submitTx(data, coin, hex, password, loading, successCall, errorCall) {
        let ls = data['ls'];
        let http = data['http'];
        let toastCtrl = data['toastCtrl'];
        let url = Constants.PUSH_TX_URL;
        let requestData = {
            emailAddress: await ls.getItem("emailAddress"),
            password: password,
            "transactionHex": hex
        };

        http.post(url, requestData, Constants.getWalletHeader(coin)).map(res => res.json()).subscribe(responseData => {
            loading.dismiss();
            if (responseData.result.response_text !== "success") {
                errorCall(data);
                Constants.showLongerToastMessage(responseData.result.error.message, toastCtrl);
            } else {
                successCall(data);
                Constants.showLongerToastMessage("Transaction Successful. The coins have been transfered.", toastCtrl);
            }
        }, error => {
            errorCall(data);
            loading.dismiss();
            Constants.showLongerToastMessage(error, toastCtrl);
        });
    }
}

//{"text":"Bitcoin","value":"BTC","symbol":"BTC","ticker_symbol":"btc","xend.fees":0.005,"block.fees":3,"xend.address":"1Bd3TqUxmL5jvmG4RU5TFjjFa88aehS9N7","xend.public_key": "036a28997453e03d0b491051c881b800ff6af6c46920c7ae8850c31f8a5420b092","multiplier":100000000, "default": "true"}
