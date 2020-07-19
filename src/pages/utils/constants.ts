import { StorageService } from "./storageservice";
import { Console } from "./console";
import { Headers } from "@angular/http";
import { networks, Network } from "bitcoinjs-lib";
import { LocalProps } from "./localprops";
import { CoinsSender } from "./coinssender";

export class Constants {
    static TOMCAT_URL = "https://lb.xendbit.com";
    static APP_VERSION = "v4.6-rc31"
    static ENABLE_GUEST = false;
    static NOTIFICATION_SOCKET_URL = "ws://ethereum.xendbit.net:8080/notify/websocket";

    //static NOTIFICATION_SOCKET_URL = "ws://192.250.236.180:8080/notify/websocket";

    static GETH_PROXY = "http://ethqoufb6-dns-reg1.eastus.cloudapp.azure.com:8540";// "http://rinkeby.xendbit.com:8546";
    static RPC_PROXY = Constants.TOMCAT_URL + "/chain/x/rpc";
    static XEND_BASE_URL = Constants.TOMCAT_URL + "/api/";
    static IMAGER_URL = Constants.TOMCAT_URL + "/imager/x/api/";

    static NETWORK = networks.bitcoin;
    static WORKING_WALLET = "ETH";
    static WORKING_TICKER_VALUE = 'eth';

    static CURRENT_WALLET = {
        "text": "Ethereum",
        "value": "ETH",
        "symbol": "ETH",
        "ticker_symbol": "eth",
        "xend.fees": 0.000625,
        "block.fees": 0.0008,
        "xend.address": "0x5b61c8d90ca057d707d3a615dcacb7f03d372bce",
        "multiplier": 1000000000000000000
    };

    static REG_TYPE = 'register';

    static IS_LOGGED_IN = false;

    static DUST = 546;
    static vector = crypto.getRandomValues(new Uint8Array(16));

    static storageService: StorageService;

    static TRADE_CANCELLED = false;

    static LAST_USD_RATE = 5000;

    static litecoinnet: Network = {
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4
        },
        pubKeyHash: 0x30,
        scriptHash: 0x32,
        wif: 0xb0
    }

    static litecointestnet: Network = {
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394
        },
        pubKeyHash: 0x6f,
        scriptHash: 0x3a,
        wif: 0xef
    };

    static NETWORKS = {
        "BTC": networks.bitcoin,
        "BTCTEST": networks.testnet,
        "LTC": Constants.litecoinnet,
        "LTCTEST": Constants.litecointestnet
    };

    static LOGGING_ENABLED = true;
    static ABI = [{ "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "to", "type": "address" }, { "name": "xendFees", "type": "uint256" }], "name": "send", "outputs": [{ "name": "success", "type": "bool" }], "payable": true, "stateMutability": "payable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }];
    static CODE = "0x6060604052341561000f57600080fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506102268061005e6000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806341c0e1b514610051578063d0679d3414610066575b600080fd5b341561005c57600080fd5b6100646100b5565b005b61009b600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610146565b604051808215151515815260200191505060405180910390f35b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415610144576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b565b60008082340390508373ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050151561018e57600080fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc849081150290604051600060405180830381858888f1935050505015156101ef57600080fd5b6001915050929150505600a165627a7a723058203d469e21c7d1d812eddd2452c0b423fd82141f44aea4bc8d2a2b43b9d19b022a0029";

    //static ONE_WEI = 1000000000000000000;
    static PAYMENT_METHOD_IMAGE_BASE_URL = Constants.XEND_BASE_URL + "images/payment_method_images";
    static SERVER_URL = Constants.XEND_BASE_URL + "x/";

    static BUY_BIT_URL = Constants.SERVER_URL + "buy/buy";
    static GET_BUY_TX_URL = Constants.SERVER_URL + "buy/tx/";
    static SEND_OTP_URL = Constants.SERVER_URL + "buy/otp";

    static SEND_2FA_CODE_URL = Constants.SERVER_URL + "user/send-2fa"
    static GET_EXCHANGE_URL = Constants.SERVER_URL + "exchange/";
    static GET_USD_RATE_URL = Constants.SERVER_URL + "exchange/usdrate/";
    static GET_EXCHANGE_RATE_URL = Constants.SERVER_URL + "exchange/xrate/";
    static POST_TRADE_URL = Constants.SERVER_URL + "exchange/post-trade";
    static BUY_CUSTOM_URL = Constants.SERVER_URL + "exchange/buy-direct";
    static HOW_MUCH_CAN_WE_SELL_URL = Constants.SERVER_URL + "exchange/how-much-can-we-sell";

    static GET_SELL_ORDERS_TX_URL = Constants.SERVER_URL + "exchange/sell-orders";
    static GET_UNSPENT_OUTPUTS_URL = Constants.SERVER_URL + "exchange/utxos/";
    static PUSH_TX_URL = Constants.SERVER_URL + "exchange/pushtx";
    static SEND_TOKEN_URL = Constants.SERVER_URL + "exchange/send-token";
    static GET_USER_SELL_ORDERS_TX_URL = Constants.SERVER_URL + "exchange/my-sell-orders"
    static GET_USER_BUY_ORDERS_TX_URL = Constants.SERVER_URL + "exchange/my-buy-orders"
    static UPDATE_USER_SELL_ORDERS_TX_URL = Constants.SERVER_URL + "exchange/my-sell-orders/update"
    static GET_MARKET_DATA_URL = Constants.SERVER_URL + "exchange/market-data"
    static RESOLVE_ACCOUNT_URL = Constants.SERVER_URL + "exchange/account/verify";
    static UPDATE_TRADE_URL = Constants.SERVER_URL + "exchange/update-exchange-status";

    static NEW_USER_URL = Constants.SERVER_URL + "user/new";
    static NEW_BENEFICIARY_URL = Constants.SERVER_URL + "user/beneficiary/new";
    static UPDATE_USER_INFO_URL = Constants.SERVER_URL + "user/update";
    static RESTORE_USER_URL = Constants.SERVER_URL + "user/restore";
    static UPGRADE_USER_URL = Constants.SERVER_URL + "user/upgrade";
    static GET_TX_URL = Constants.SERVER_URL + "user/transactions/";
    static SEND_URL = Constants.SERVER_URL + "user/send-coins";
    static LOGIN_URL = Constants.SERVER_URL + "user/login";
    static SEND_CONFIRMATION_EMAIL_URL = Constants.SERVER_URL + "user/send-confirmation-email";
    static ADD_KYC_URL = Constants.SERVER_URL + "user/add/kyc";
    static XND_ACCOUNT_ID_URL = Constants.SERVER_URL + "user/get-account-id";
    static GET_ADDRESS_URL = Constants.SERVER_URL + "user/get-address";
    static LOAD_BENEFICIARIES_URL = Constants.SERVER_URL + "user/beneficiaries";
    static GET_IMAGE_URL = Constants.IMAGER_URL + "get-image";
    static BECOME_BENEFICIARY_URL = Constants.SERVER_URL + "user/become-beneficiary";
    static GET_13TH_WORD = Constants.SERVER_URL + "user/get-last-word";

    static SEND_2_BANK_URL = Constants.SERVER_URL + "send2bank/new";
    static GET_SEND_2_BANK_REQUEST_URL = Constants.SERVER_URL + "send2bank/tx/";
    static APP_NAME = "XendbitV1.0Client";

    static REG_STATUS_URL = Constants.SERVER_URL + "register/status";
    static UPLOAD_URL = Constants.SERVER_URL + "register/upload";

    private static currentTime = new Date().getTime();

    static SETTINGS_URL = Constants.XEND_BASE_URL + "en.ng.json?x_session_id=" + Constants.currentTime;

    static CHART_URL = "https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol={{symbol}}&market=USD&apikey=MIX93213R84R24Z9";

    static LONGER_TOAST_DURATION = 5000;
    static LONG_TOAST_DURATION = 5000;
    static WAIT_FOR_STORAGE_TO_BE_READY_DURATION = 1000;
    static SATOSHI = 100000000;
    static QR_CODE_URL = Constants.XEND_BASE_URL + "qrcode?address=";
    static AFTER_UPGRADE_WARNING = "";

    static CARD_PAYMENT_METHOD_VALUE = 1;
    static VOGUE_PAY_METHOD_VALUE = 2;
    static PAYSTACK_METHOD_VALUE = 3;
    static DIRECT_TRANSFER_METHOD_VALUE = 4;

    static VIEW_TX_BASE = "https://chain.so/tx/";

    static passwordPadSuccessCallback: any;
    static registrationData = {};
    static otherData = {};

    static properties = LocalProps.properties;

    static showAlert(toastCtrl, title, subtitle) {
        Constants.showLongerToastMessage(subtitle, toastCtrl);
    }

    static askBeneficiaryForAddress(data, home) {
        let donor = data['donor'];
        let coin = data['coin'];

        let message = 'Hello, ' + donor + ' has indicated interest in sending you some ' + coin + '. Do you want to accept this donation?';

        let alert = home.alertCtrl.create({
            title: 'Accept Donation?',
            message: message,
            buttons: [
                {
                    text: "Don't Accept",
                    role: 'cancel',
                    handler: () => {
                        //doNothing
                    }
                },
                {
                    text: 'Accept',
                    handler: () => {
                        let ws = Constants.properties['ws_connection'];

                        let key = coin + "Address";
                        let address = home.ls.getItem(key);
                        let wsData = {
                            "donorEmailAddress": data['donorEmailAddress'],
                            "beneficiaryEmailAddress": home.ls.getItem("emailAddress"),
                            "coin": coin,
                            "address": address,
                            "action": "provideAddressToDonor"
                        };

                        ws.send(Constants.encryptData(JSON.stringify(wsData))).subscribe((responseData) => {
                        }, (error) => {
                        }, () => {
                        });
                    }
                }
            ]
        });
        alert.present();
    }

    static showLongToastMessage(message, toastCtrl) {
        let toast = toastCtrl.create({
            message: message,
            duration: 5000
        });

        toast.onDidDismiss(() => {
        });

        toast.present();
    }

    static showShortToastMessage(message, toastCtrl) {
        let toast = toastCtrl.create({
            message: message,
            duration: 500
        });

        toast.onDidDismiss(() => {
        });

        toast.present();
    }

    static showLongerToastMessage(message, toastCtrl) {
        let toast = toastCtrl.create({
            message: message,
            duration: 5000
        });

        toast.onDidDismiss(() => {
        });

        toast.present();
    }

    static showLoading(loading, loadingCtrl, message) {
        loading = loadingCtrl.create({
            content: message
        });
        loading.present();
        return loading;
    }

    static showPersistentToastMessage(message, toastCtrl) {
        let toast = toastCtrl.create({
            message: message,
            duration: 5000
        });

        toast.onDidDismiss(() => {
        });

        toast.present();
        return toast;
    }

    static registerBeneficiary() {
        let postData = Constants.registrationData;
        let otherData = Constants.otherData;

        let url = Constants.NEW_BENEFICIARY_URL;
        let http = otherData['http'];
        let toastCtrl = otherData['toastCtrl'];
        let loading = otherData['loading'];
        let loadingCtrl = otherData['loadingCtrl'];
        loading = Constants.showLoading(loading, loadingCtrl, "Please Wait...");

        Console.log(url);
        Console.log(postData);
        Console.log(otherData);

        http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(
            responseData => {
                loading.dismiss();
                if (responseData.response_text === 'success') {
                    Constants.showPersistentToastMessage("Beneficiary Registration Successful.", toastCtrl);
                    Constants.registrationData['userPassphrase'] = responseData.beneficiary.encryptedPassphrase;
                    otherData['navCtrl'].push('BarcodePrinterPage', { 'userPassphrase': responseData.beneficiary.encryptedPassphrase });
                } else if (responseData.response_text === 'error') {
                    Constants.showPersistentToastMessage(responseData.result, toastCtrl);
                }
            },
            error => {
                loading.dismiss();
                Constants.showPersistentToastMessage("Can not register beneficiary at this time: " + error, toastCtrl);

            }
        );
    }

    static completeRegistration() {
        let data = Constants.registrationData;
        let ls = data['ls'];

        let mnemonicCode = Constants.normalizeMnemonicCode(ls);
        let xendNetworkAddress = "N/A";

        if (Constants.IS_LOGGED_IN) {
            mnemonicCode = Constants.registrationData['mnemonic']
        }

        let dateRegistered = "" + new Date().getTime();
        let postData = {
            password: data['password'],
            phoneNumber: data['phoneNumber'],
            emailAddress: data['email'],
            surName: data['surName'],
            firstName: data['firstName'],
            middleName: data['middleName'],
            idType: data['idType'],
            idNumber: data['idNumber'],
            idImage: data['idImage'],
            walletType: data['walletType'],
            accountType: "ADVANCED",
            country: data['country'],
            enableWhatsapp: data['enableWhatsapp'] === 'Yes' ? true : false,
            bankCode: data['bankCode'],
            bankName: data['bankName'],
            accountNumber: data['accountNumber'],
            dateRegistered: dateRegistered,
            beneficiary: data['isBeneficiary'],
            passphrase: mnemonicCode,
            xendNetworkAddress: xendNetworkAddress,
            referralCode: data['referralCode'],
            dob: data['dateOfBirth'],
            bvn: data['bvn'],
            agentEmail: ls.getItem("emailAddress")
        };

        Console.log(postData);

        let url = data['url'];
        let http = data['http'];
        let toastCtrl = data['toastCtrl'];
        let loading = data['loading'];
        let loadingCtrl = data['loadingCtrl'];

        loading = Constants.showLoading(loading, loadingCtrl, "Please Wait...");
        http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(
            responseData => {
                if (responseData.response_text === "success") {
                    loading.dismiss();

                    Console.log("ILI: " + Constants.IS_LOGGED_IN);
                    Console.log("Nav Ctrl: " + data['navCtrl']);

                    if (Constants.IS_LOGGED_IN) {
                        Constants.showPersistentToastMessage("Beneficiary Registration Successful.", toastCtrl);
                        Constants.registrationData['userPassphrase'] = responseData.user.passphrase;
                        data['navCtrl'].push('BarcodePrinterPage', { 'userPassphrase': responseData.user.passphrase });
                        return;
                    } else if (data['updateInfo']) {
                        ls.setItem("emailAddress", data['email']);
                        ls.setItem("password", data['password']);
                        ls.setItem("isRegistered", "true");
                        Constants.showPersistentToastMessage("Update Successful.", toastCtrl);
                        data['navCtrl'].pop();
                        return;
                    } else {
                        ls.setItem("emailAddress", data['email']);
                        ls.setItem("password", data['password']);
                        ls.setItem("isRegistered", "true");
                        Constants.showPersistentToastMessage("Registration Successful. Please Login", toastCtrl);
                        data['navCtrl'].push('LoginPage');
                        return;
                    }
                } else {
                    Constants.showPersistentToastMessage(responseData.result, toastCtrl);
                    loading.dismiss();
                }
            },
            error => {
                loading.dismiss();
                Constants.showPersistentToastMessage("Error from server: " + error, toastCtrl);
            });
    }

    static registerOnServer() {
        Constants.completeRegistration();
    }

    static getHeader() {
        let wallet = Constants.WORKING_WALLET;
        if (wallet.startsWith("t")) {
            wallet = wallet.replace("t", "");
        }
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('apiKey', 'oalkuisnetgauyno');
        headers.append('wallet', wallet);
        return { headers: headers };
    }

    static getWalletHeader(wallet: string) {
        if (wallet.startsWith("t")) {
            wallet = wallet.replace("t", "");
        }
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('apiKey', 'oalkuisnetgauyno');
        headers.append('wallet', wallet);
        return { headers: headers };
    }

    static sendCoinsToBuyerError(data) {
        let message = data['message'];
        let connection = data['connection'];
        let wsData = {
            "buyerEmailAddress": message['buyerEmailAddress'],
            "action": "errorSendingToBuyer",
        };
        connection.send(Constants.encryptData(JSON.stringify(wsData))).subscribe((responseData) => {
        }, (error) => {
            //doNothing
        }, () => {
            //doNothing
        });
    }

    static sendCoinsToBuyerSuccess(data) {
        let message = data['message'];
        let connection = data['connection'];
        let buyerOtherAddress = message['buyerOtherAddress'];

        let wsData = {
            "trxId": message['trxId'],
            "buyerAddress": message['buyerAddress'],
            "action": "sellerSentCoins",
            "buyerEmailAddress": message['buyerEmailAddress'],
            "buyerOtherAddress": buyerOtherAddress
        };

        connection.send(Constants.encryptData(JSON.stringify(wsData))).subscribe((responseData) => {
            //doNothing
        }, (error) => {
            //doNothing
        }, () => {
            //doNothing
        });
    }

    static sendCoinsToSellerError(data) {
        let message = data['message'];
        let connection = data['connection'];
        let wsData = {
            "trxId": message['trxId'],
            "buyerEmailAddress": message['buyerEmailAddress'],
            "action": "errorSendingToSeller",
        };

        connection.send(Constants.encryptData(JSON.stringify(wsData))).subscribe((responseData) => {
        }, (error) => {
            //doNothing
        }, () => {
            //doNothing
        });
    }

    static sendCoinsToSellerSuccess(data) {
        let message = data['message'];
        let connection = data['connection'];

        let wsData = {
            "trxId": message['trxId'],
            "action": "buyerSentCoins",
            "buyerEmailAddress": message['buyerEmailAddress']
        };

        connection.send(Constants.encryptData(JSON.stringify(wsData))).subscribe((responseData) => {
            //doNothing
        }, (error) => {
            //doNothing
        }, () => {
            //doNothing
        });
    }

    static sendCoinsToSeller(message, home, connection, buyerOtherAddress) {
        Console.log("sendCoinsToSeller");

        let data = {};
        data['amount'] = message['amountToRecieve'];
        data['recipientAddress'] = message['sellerOtherAddress'];
        data['loading'] = home.loading;
        data['loadingCtrl'] = home.loadingCtrl;
        data['ls'] = home.ls;
        data['toastCtrl'] = home.toastCtrl;
        data['http'] = home.http;
        data['connection'] = connection;
        data['message'] = message;
        data['alertCtrl'] = home.alertCtrl;

        let coin: string = message['toCoin'];

        if (coin.indexOf("BTC") >= 0) {
            let network = Constants.NETWORKS[coin];
            CoinsSender.sendCoinsBtc(data, Constants.sendCoinsToSellerSuccess, Constants.sendCoinsToSellerError, coin, buyerOtherAddress, network)
        } else if (coin.indexOf("ETH") >= 0) {
            CoinsSender.sendCoinsEth(data, Constants.sendCoinsToSellerSuccess, Constants.sendCoinsToSellerError, coin);
        } else {
            //CoinsSender.sendCoinsXnd(data, Constants.sendCoinsToSellerSuccess, Constants.sendCoinsToSellerError, fees);
        }
    }

    static sellerConfirmTrade(data, home) {
        let message = data['message']['message'] + " " + data['amount'];
        let actionSheet = home.actionSheetCtrl.create({
            title: message,
            buttons: [
                {
                    text: 'Continue?',
                    handler: () => {
                        Constants.craftMultisig(data);
                    }
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                    }
                }
            ]
        });
        actionSheet.present();
    }

    static craftMultisig(data) {
        let message = data['message'];
        let coin: string = message['fromCoin'];
        let key = coin + "Address";
        let ls = data['ls'];
        let fromAddress = ls.getItem(key);
        let network = Constants.NETWORKS[coin];
        CoinsSender.craftMultisig(data, Constants.askBuyerToPay, Constants.sendCoinsToBuyerError, coin, fromAddress, network);
    }

    static startTrade(message, home, connection) {
        let data = {};
        data['loading'] = home.loading;
        data['loadingCtrl'] = home.loadingCtrl;
        data['ls'] = home.ls;
        data['toastCtrl'] = home.toastCtrl;
        data['http'] = home.http;
        data['connection'] = connection;
        data['message'] = message;
        data['alertCtrl'] = home.alertCtrl;

        let coin: string = message['fromCoin'];
        let key = coin + "Address";
        let fromAddress = home.ls.getItem(key);
        data['amount'] = message['amountToSell'];
        data['recipientAddress'] = message['buyerAddress'];

        console.log(data);

        let toCoin = message['toCoin'];
        let fees = Constants.getWalletProperties(coin);
        Console.log(fees);

        let bankPaymentMethodsValues = Constants.properties['payment.methods'].map(x => x.value);
        if (bankPaymentMethodsValues.indexOf(toCoin) >= 0) {
            Constants.sellerConfirmTrade(data, home);
        } else {
            if (fees.btcText.indexOf('ETH') > 0) {
                CoinsSender.sendCoinsEth(data, Constants.sendCoinsToBuyerSuccess, Constants.sendCoinsToBuyerError, coin);
            } else if (fees.btcText.indexOf('XND') >= 0 || fees.btcText.indexOf('NXT') >= 0 || fees.btcText.indexOf('ARDOR') >= 0 || fees.btcText.indexOf('IGNIS') >= 0) {
                //CoinsSender.sendCoinsXnd(data, Constants.sendCoinsToBuyerSuccess, Constants.sendCoinsToBuyerError, fees);
            } else if (fees.currencyId !== undefined) {
                //CoinsSender.sendCoinsXnd(data, Constants.sendCoinsToBuyerSuccess, Constants.sendCoinsToBuyerError, fees);
            } else if (fees.equityId !== undefined) {
                //CoinsSender.sendCoinsXnd(data, Constants.sendCoinsToBuyerSuccess, Constants.sendCoinsToBuyerError, fees);
            } else {
                let network = Constants.NETWORKS[coin];
                CoinsSender.sendCoinsBtc(data, Constants.sendCoinsToBuyerSuccess, Constants.sendCoinsToBuyerError, coin, fromAddress, network);
            }
        }
    }

    static releaseCoins(message, home) {
        let trxId = message['trxId'];
        let http = home.http;

        let url = Constants.GET_EXCHANGE_URL + trxId;
        http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(
            responseData => {
                let sellOrder = responseData.result;
                Constants.properties['finalize_sale_order'] = sellOrder;
                home.navCtrl.push('ShowBankPaymentPage');
            },
            _error => {
                Constants.showLongToastMessage("Unable to get sell-order properties. Please try again later", home.toastCtrl);
            });
    }

    static paySeller(message, navCtrl) {
        let sellerOtherAddress = message['sellerOtherAddress'];
        let splitted = sellerOtherAddress.split(":");
        let sellerBank = splitted[0];
        let sellerAccountNumber = splitted[1];
        let amountToSell = message['amountToSell'];
        let amountToRecieve = message['amountToRecieve'];
        let trxId = message['trxId'];
        let seller = JSON.parse(message['seller']);

        Constants.properties['buyWithBankMessage'] = {
            "sellerBank": sellerBank,
            "sellerAccountNumber": sellerAccountNumber,
            "amount": amountToSell,
            "amountToRecieve": amountToRecieve,
            "trxId": trxId,
            "seller": seller
        };

        navCtrl.push('BuyWithBankAccountPage');
    }

    static askBuyerToPay(data) {
        Console.log("Asking Buyer to Pay");
        let wsConnection = data['connection'];
        let message = data['message'];
        let buyerEmailAddress = message['buyerEmailAddress'];
        let buyerOtherAddress = message['buyerOtherAddress'];
        let buyerAddress = message['buyerAddress'];
        let trxHex = data['trxHex'];

        let ecHex = Constants.encryptData(trxHex);

        let wsData = {
            "trxId": message['trxId'],
            "buyerEmailAddress": buyerEmailAddress,
            "buyerOtherAddress": buyerOtherAddress,
            "buyerAddress": buyerAddress,
            "trxHex": ecHex,
            "action": "askBuyerToPay"
        };

        Console.log(wsData);

        wsConnection.send(Constants.encryptData(JSON.stringify(wsData))).subscribe((_responseData) => {
            //doNothing
        }, (_error) => {
            //doNothing
        }, () => {
            //doNothing
        });
    }

    static getWalletProperties(currentWallet: string) {
        let xendFees = 0;
        let blockFees = 0;
        let currencyText = "";
        let btcText = "";
        let value = "";
        let xendAddress = "";
        let tickerSymbol = "";
        let multiplier = 1;
        let url = "";
        let contract = "";
        let currencyId = "";
        let equityId = "";
        let publicKey = "";

        let wallets = Constants.properties['wallets'];
        for (let w in wallets) {
            let wallet = wallets[w];
            if (wallet['value'] === currentWallet) {
                xendFees = wallet['xend.fees'];
                blockFees = wallet['block.fees'];
                currencyText = wallet['text'];
                btcText = wallet['symbol'];
                value = wallet['value'];
                xendAddress = wallet['xend.address'];
                tickerSymbol = wallet['ticker_symbol'];
                multiplier = wallet['multiplier']
                url = wallet['url'];
                contract = wallet['contract'];
                currencyId = wallet['currencyId'];
                equityId = wallet['equityId'];
                publicKey = wallet['xend.public_key'];
            }
        }

        let fees = {
            "xendFees": xendFees,
            "blockFees": blockFees,
            "currencyText": currencyText,
            "btcText": btcText,
            "value": value,
            "xendAddress": xendAddress,
            "tickerSymbol": tickerSymbol,
            "multiplier": multiplier,
            "contract": contract,
            "url": url,
            "currencyId": currencyId,
            "equityId": equityId,
            "publicKey": publicKey
        };
        return fees;
    }

    static getCurrentWalletProperties() {
        if (Constants.WORKING_WALLET === undefined || Constants.WORKING_WALLET === "") {
            Constants.WORKING_WALLET = "BTC";
        }
        return Constants.getWalletProperties(Constants.WORKING_WALLET);
    }

    static btcWallet(ls: StorageService, loading, loadingCtrl, http, toastCtrl, chainCode) {
    }

    static xndWallet(ls: StorageService, loading, loadingCtrl, http, toastCtrl, chainCode) {
        // if (ls.getItem(chainCode + "Id") !== undefined && ls.getItem(chainCode + "Id") !== "") {
        //     return;
        // }

        // let mnemonicCode = Constants.normalizeMnemonicCode(ls);

        // let url = Constants.XND_ACCOUNT_ID_URL + "/" + chainCode;

        // let requestData = {
        //     "passphrase": mnemonicCode
        // };

        // loading = Constants.showLoading(loading, loadingCtrl, "Please wait");

        // http.post(url, requestData, Constants.getHeader()).map(res => res.json()).subscribe(data => {
        //     let accountRS = data.result.accountRS;
        //     let accountId = data.result.account;
        //     let publicKey = data.result.publicKey;

        //     ls.setItem(chainCode + 'Address', accountRS);
        //     ls.setItem(chainCode + 'Id', accountId);
        //     ls.setItem(chainCode + 'PublicKey', publicKey);
        //     loading.dismiss();
        // }, error => {
        //     Constants.showLongerToastMessage("Error getting your account id from the server: " + error, toastCtrl);
        //     loading.dismiss();
        // });
    }

    static tokenWallet(ls: StorageService, loading, loadingCtrl, http, toastCtrl, coin) {
    }

    static normalizeMnemonicCode(ls: StorageService) {
        // let mnemonicCode = ls.getItem('mnemonic');

        // let lastIndex = mnemonicCode.lastIndexOf(" ");

        // mnemonicCode = mnemonicCode.substr(0, lastIndex).trim();
        let mnemonicCode = ls.getItem('mnemonic');
        return mnemonicCode;
    }

    static ethWallet(ls: StorageService, loading, loadingCtrl, http, toastCtrl, chainCode) {
        if (ls.getItem("ETHAddress") !== undefined && ls.getItem("ETHAddress") !== "") {
            let ethAddress = ls.getItem('ETHAddress');
            ls.setItem("ETHTESTAddress", ethAddress);
            return;
        }

        let mnemonicCode = Constants.normalizeMnemonicCode(ls);

        let url = Constants.GET_ADDRESS_URL + "/" + chainCode;

        let requestData = {
            "passphrase": mnemonicCode
        };

        loading = Constants.showLoading(loading, loadingCtrl, "Please wait");

        http.post(url, requestData, Constants.getHeader()).map(res => res.json()).subscribe(data => {
            let encPassphrase = data.result.mnemonicCode;
            let address = data.result.chainAddress;
            let encPrivateKey = data.result.wif;

            ls.setItem(chainCode + 'Address', address);
            ls.setItem(chainCode + 'Passphrase', encPassphrase);
            ls.setItem(chainCode + 'WIF', encPrivateKey);
            loading.dismiss();
        }, error => {
            Constants.showLongerToastMessage("Error getting your account id from the server: " + error, toastCtrl);
            loading.dismiss();
        });
    }

    static encryptData(data) {
        let key = Constants.makeid();
        let b64Data = btoa(data);
        let b64Key = btoa(key);
        let part1Key = b64Key.substr(0, 5);
        let part2Key = b64Key.substr(b64Key.length - 5, b64Key.length);
        let coded = part1Key + b64Data + part2Key;
        let result = btoa(coded);
        return result;
    }

    static decryptData(data) {
        try {
            let coded = atob(data);
            let part1Key = coded.substr(0, 5);
            let part2Key = coded.substr(coded.length - 5, coded.length);
            coded = coded.replace(part1Key, "").replace(part2Key, "");
            return atob(coded);
        } catch (e) {
            return data;
        }
    }

    static makeReference() {
        var text = "";
        var possible = "ABCDEFGHJKLMNPQRSTUVWXYZ";

        for (let i = 0; i < 4; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    static makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 10; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    static formatDate(date) {
        var monthNames = [
            "JAN", "FEB", "MAR",
            "APR", "MAY", "JUN", "JUL",
            "AUG", "SEP", "OCT",
            "NOV", "DEC"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + '/' + monthNames[monthIndex] + '/' + year;
    }
}
