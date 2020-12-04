import { StorageService } from "./storageservice";
import { Headers } from "@angular/http";
import { LocalProps } from "./localprops";
import { Wallet, Fees } from "./wallet";

export class Constants {
    // static TOMCAT_URL = "https://xendfilb.xendbit.net";
    static APP_VERSION = "v4.6-rc31"
    static ENABLE_GUEST = false;
    static TOMCAT_URL = "http://localhost:8080";
    //static TOMCAT_URL = "https://lb.xendbit.com";
    static XEND_BASE_URL = Constants.TOMCAT_URL + "/api/";
    static IMAGER_URL = Constants.TOMCAT_URL + "/imager/x/api/";

    static WORKING_WALLET = "BTC";
    static WALLET = undefined;
    static WORKING_TICKER_VALUE = 'btc';

    static REG_TYPE = 'register';

    static NGNC_ACTION = 'fund';
    static DUST = 546;
    static vector = crypto.getRandomValues(new Uint8Array(16));

    static storageService: StorageService;

    static TRADE_CANCELLED = false;

    static LAST_USD_RATE = 5000;

    static LOGGED_IN_USER = undefined;

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
    static SELL_TRADE_URL = Constants.SERVER_URL + "exchange/sell-trade";
    static BUY_TRADE_URL = Constants.SERVER_URL + "exchange/buy-trade";
    static BUY_CUSTOM_URL = Constants.SERVER_URL + "exchange/buy-direct";

    static GET_SELL_ORDERS_TX_URL = Constants.SERVER_URL + "exchange/sell-orders";
    static GET_UNSPENT_OUTPUTS_URL = Constants.SERVER_URL + "exchange/utxos/";
    static GET_USER_SELL_ORDERS_TX_URL = Constants.SERVER_URL + "exchange/my-sell-orders"
    static GET_USER_BUY_ORDERS_TX_URL = Constants.SERVER_URL + "exchange/my-buy-orders"
    static UPDATE_USER_SELL_ORDERS_TX_URL = Constants.SERVER_URL + "exchange/my-sell-orders/update"
    static RESOLVE_ACCOUNT_URL = Constants.SERVER_URL + "exchange/account/verify";
    static UPDATE_TRADE_URL = Constants.SERVER_URL + "exchange/update-exchange-status";
    static SEND_COINS_URL = Constants.SERVER_URL + "exchange/send-coins";

    static NEW_USER_URL = Constants.SERVER_URL + "user/new";
    static UPDATE_USER_INFO_URL = Constants.SERVER_URL + "user/update";
    static RESTORE_USER_URL = Constants.SERVER_URL + "user/restore";
    static UPGRADE_USER_URL = Constants.SERVER_URL + "user/upgrade";
    static GET_TX_URL = Constants.SERVER_URL + "user/transactions/";
    static SEND_URL = Constants.SERVER_URL + "user/send-coins";
    static LOGIN_URL = Constants.SERVER_URL + "user/login";
    static SEND_CONFIRMATION_EMAIL_URL = Constants.SERVER_URL + "user/send-confirmation-email";
    static ADD_KYC_URL = Constants.SERVER_URL + "user/add/kyc";
    static LOAD_BENEFICIARIES_URL = Constants.SERVER_URL + "user/beneficiaries";
    static GET_IMAGE_URL = Constants.IMAGER_URL + "get-image";
    static GET_13TH_WORD = Constants.SERVER_URL + "user/get-last-word";

    static SEND_2_BANK_URL = Constants.SERVER_URL + "send2bank/new";
    static GET_SEND_2_BANK_REQUEST_URL = Constants.SERVER_URL + "send2bank/tx/";

    static GET_NGNC_BALANCE_URL = Constants.SERVER_URL + "user/#{userId}/get-ngnc-balance";
    static WITHDRAW_NGNC_URL = Constants.SERVER_URL + "user/withdraw-ngnc";

    static TRADE_URL = Constants.SERVER_URL + "exchange/trade";

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

    static properties = LocalProps.properties;

    static showAlert(toastCtrl, title, subtitle) {
        Constants.showLongerToastMessage(subtitle, toastCtrl);
    }

    static showLongToastMessage(message, toastCtrl) {
        let toast = toastCtrl.create({
            message: message,
            duration: 10000
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
            duration: 10000
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

    static completeRegistration() {
        let data = Constants.registrationData;
        let ls = data['ls'];

        let mnemonicCode = Constants.normalizeMnemonicCode(ls);
        let xendNetworkAddress = ls.getItem('XNDAddress');

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
            referralCode: data['referralCode']
        };


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
                    ls.setItem("emailAddress", data['email']);
                    ls.setItem("password", data['password']);
                    ls.setItem("isRegistered", "true");
                    if (data['updateInfo']) {
                        Constants.showPersistentToastMessage("Update Successful.", toastCtrl);
                        data['navCtrl'].pop();
                        return;
                    } else {
                        Constants.showPersistentToastMessage("Registration Successful. Please Login", toastCtrl);
                        //data['navCtrl'].push(LoginPage);
                        data['navCtrl'].popToRoot();
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

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('apiKey', 'oalkuisnetgauyno');
        headers.append('wallet', wallet);
        return { headers: headers };
    }

    static getWalletHeader(wallet: string) {
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

    static normalizeMnemonicCode(ls: StorageService) {
        let mnemonicCode = ls.getItem('mnemonic');
        return mnemonicCode;
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

    static getWalletFormatted(w): Wallet {
      let chain = w['chain'];
      let chainAddress = w['chainAddress'];

      let wallet: Wallet = new Wallet();
      wallet.tickerSymbol = chain.toLowerCase();
      wallet.chainAddress = chainAddress;
      wallet.chain = chain;
      
      const fees: Fees = new Fees();                  
      fees.externalDepositFees = w['fees']['externalDepositFees'];
      fees.maxXendFees = w['fees']['maxXendFees'];
      fees.minBlockFees = w['fees']['minBlockFees'];
      fees.minXendFees = w['fees']['minXendFees'];
      fees.percExternalTradingFees = w['fees']['percExternalTradingFees'];
      fees.externalWithdrawalFees = w['fees']['externalWithdrawalFees'];
      fees.percXendFees = w['fees']['percXendFees'];
      fees.tickerSymbol = wallet.tickerSymbol;
      fees.chain = wallet.chain;
      fees.chainAddress = wallet.chainAddress;
      wallet.fees = fees;

      return wallet;
    }
}
