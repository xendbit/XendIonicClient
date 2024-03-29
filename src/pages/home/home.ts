import { StorageService } from './../utils/storageservice';
import { WSConnection } from './../utils/websocketconnection';
import { Constants } from './../utils/constants';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { Platform, ActionSheetController, ModalController, AlertController, NavController, ToastController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@IonicPage()
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {
    networkAddress: string;
    confirmedAccountBalance: number;
    totalSent: number;
    totalReceived: number;
    escrow: number;

    cashBalance: number = 0;
    ls: StorageService;
    allTransactions: any = [];
    utx: any = [];
    ctx: any = [];
    static wallet: any;
    loading: Loading;

    pageTitle: string;
    yourBTCWalletText: string;
    yourCashWalletText: string;
    clickToCopyText: string;
    accountBalanceText: string;
    xendBalance: string;
    historyText: string;
    cashSymbolText: string;
    btcText: string;
    sellBitText: string;
    loadWalletText: string;
    private clipboard: Clipboard;
    usdRate: number = 0;
    btcRate: number = 0;
    btcToNgn = 0;
    qrType = 'img';
    qrValue: string;
    qrCssClass = "hide";
    isShowingQr = false;
    currencyText: string;
    emailAddress: string;
    showXendBalance = true;
    isAdvanced = false;
    isEquities = false;
    isBeneficiary = false;

    cryptoSellOrderText = 'Sell';
    cryptoBuyOrderText = 'Buy';
    fiatSellOrderText = 'Fiat Sell-Order';

    constructor(public modalCtrl: ModalController, public alertCtrl: AlertController, public platform: Platform, public loadingCtrl: LoadingController, public navCtrl: NavController, public http: Http, public toastCtrl: ToastController, public localNotifications: LocalNotifications, public actionSheetCtrl: ActionSheetController) {
        this.clipboard = new Clipboard();
        this.ls = Constants.storageService;
        this.initProps();
        Constants.properties['home'] = this;
        Console.log("Working Wallet: " + Constants.WORKING_WALLET);
    }

    loadRate() {
        let fees = Constants.getCurrentWalletProperties();
        let tickerSymbol = fees.tickerSymbol;
        let url = Constants.GET_USD_RATE_URL + tickerSymbol;

        this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
            this.usdRate = responseData.result.buy;
            this.btcRate = responseData.result.rate;
            this.btcToNgn = this.btcRate / this.usdRate;
        }, error => {
            //doNothing
        });
    }

    getXndBalance() {
        if (this.ls.getItem("XNDAddress") === undefined || this.ls.getItem("XNDAddress") === "") {
            return;
        }
        let postData = {
            password: this.ls.getItem("password"),
            networkAddress: this.ls.getItem("XNDAddress"),
            emailAddress: this.ls.getItem("emailAddress")
        };

        this.http.post(Constants.GET_TX_URL, postData, Constants.getWalletHeader("XND"))
            .map(res => res.json())
            .subscribe(responseData => {
                if (responseData.response_code === 0) {
                    this.utx = [];
                    this.ctx = [];
                    this.xendBalance = responseData.result.balance
                    this.ls.setItem("xendBalance", responseData.result.balance);
                }
            }, error => {
                //doNothing
            });
    }

    copyBitcoinAddress() {
        if (this.isShowingQr) {
            this.qrCssClass = "hide";
            this.isShowingQr = false;
        } else {
            this.qrCssClass = "show";
            this.isShowingQr = true;
        }
        this.clipboard.copy(this.networkAddress);
        let fees = Constants.getCurrentWalletProperties();
        let message = "Coin Address Copied".replace("Coin", fees.currencyText);
        Constants.showLongToastMessage(message, this.toastCtrl);
    }

    refresh(showLoading) {
        let app = this;
        setTimeout(function () {
            let key = Constants.WORKING_WALLET + "Address";
            Console.log(key);
            app.qrValue = app.ls.getItem(key);
            app.emailAddress = app.ls.getItem('emailAddress');
            WSConnection.startListeningForNotifications(app);
            app.networkAddress = app.ls.getItem(key);
            Constants.NETWORK = Constants.NETWORKS[Constants.WORKING_WALLET];
            let fees = Constants.getCurrentWalletProperties();
            app.currencyText = fees.currencyText;
            app.btcText = fees.btcText;

            app.yourBTCWalletText = "My Coin Wallet".replace('Coin', app.btcText);

            Console.log(app.yourBTCWalletText);

            app.yourBTCWalletText = app.yourBTCWalletText.replace('/t*BTC/gi', app.btcText);
            Console.log(app.yourBTCWalletText);
            if (app.showXendBalance == true) {
                app.getXndBalance();
            }
            app.getTransactions(showLoading);
            app.loadRate();
        }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
    }


    ionViewDidLoad() {
        Console.log('ionViewDidLoad HomePage');
        if (this.ls.getItem("exchangeType") === 'exchange') {
            this.cryptoSellOrderText = 'Sell';
            this.cryptoBuyOrderText = 'Buy';
            this.fiatSellOrderText = 'Fiat Sell-Order'
        } else {
            this.cryptoSellOrderText = 'Sell';
            this.cryptoBuyOrderText = 'Buy';
            this.fiatSellOrderText = 'Sell Equities'
        }
        let app = this;
        setTimeout(function () {
            //Do all wallets.
            let wallets = Constants.properties['wallets'];
            for (let w in wallets) {
                let wallet = wallets[w];
                let coin = wallet['value'];

                if (coin.indexOf("ETH") >= 0) {
                    Constants.ethWallet(app.ls);
                } else if (coin === "XND") {
                    Constants.xndWallet(app.ls, app.loading, app.loadingCtrl, app.http, app.toastCtrl, coin);
                } else if (coin === "NXT") {
                    Constants.xndWallet(app.ls, app.loading, app.loadingCtrl, app.http, app.toastCtrl, coin);
                } else if (coin === "ARDR") {
                    Constants.xndWallet(app.ls, app.loading, app.loadingCtrl, app.http, app.toastCtrl, coin);
                } else if (coin === "IGNIS") {
                    Constants.xndWallet(app.ls, app.loading, app.loadingCtrl, app.http, app.toastCtrl, coin);
                } else if (wallet['currencyId'] !== undefined) {
                    Constants.tokenWallet(app.ls, app.loading, app.loadingCtrl, app.http, app.toastCtrl, coin);
                } else {
                    Constants.btcWallet(app.ls, app.loading, app.loadingCtrl, app.http, app.toastCtrl, coin);
                }
            }
        }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION)
    }

    ionViewDidEnter() {
        Console.log('ionViewDidEnter HomePage');
        this.isAdvanced = false;
        this.isEquities = this.ls.getItem("exchangeType") !== 'exchange';

        this.refresh(false);
        if (StorageService.ACCOUNT_TYPE === "ADVANCED") {
            this.isAdvanced = true;
        }

        if (this.ls.getItem("exchangeType") === 'exchange') {
            this.cryptoSellOrderText = 'Sell';
            this.cryptoBuyOrderText = 'Buy';
            this.fiatSellOrderText = 'Fiat Sell Order'
        } else {
            this.cryptoSellOrderText = 'Sell';
            this.cryptoBuyOrderText = 'Buy';
            this.fiatSellOrderText = 'Sell Equities'
        }
    }

    ionViewWillLeave() {
        Console.log('ionViewWillLeave HomePage');
    }

    getTransactions(showLoading) {
        let fees = Constants.getCurrentWalletProperties();
        Console.log(fees);
        if (showLoading) {
            this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
        }

        let key = Constants.WORKING_WALLET + "Address";

        let postData = {
            password: this.ls.getItem("password"),
            networkAddress: this.ls.getItem(key),
            emailAddress: this.ls.getItem("emailAddress"),
            currencyId: fees.currencyId,
            equityId: fees.equityId
        };

        Console.log(postData);

        this.http.post(Constants.GET_TX_URL, postData, Constants.getHeader())
            .map(res => res.json())
            .subscribe(responseData => {
                if (showLoading) {
                    this.loading.dismiss();
                }
                //if (responseData.response_text === "success") {
                if (responseData.response_code === 0) {
                    this.utx = [];
                    this.ctx = [];
                    this.confirmedAccountBalance = responseData.result.balance
                    Console.log("confirmedAccountBalance: " + this.confirmedAccountBalance);
                    this.ls.setItem(Constants.WORKING_WALLET + "confirmedAccountBalance", responseData.result.balance);
                    this.totalReceived = responseData.result.received
                    this.totalSent = responseData.result.spent

                    this.escrow = responseData.result.escrow === 0 ? 0 : (responseData.result.escrow)

                    let key = Constants.WORKING_WALLET + "Address";
                    this.networkAddress = this.ls.getItem(key);
                    for (let txData of responseData.result.transactions) {
                        let tx = {
                            tx: txData.hash,
                            url: txData.url,
                            value: txData.value,
                            confirmations: txData.confirmations,
                            incoming: txData.incoming
                        }
                        this.checkTransaction(tx);
                    }
                }
            }, _error => {
                if (showLoading) {
                    this.loading.dismiss();
                }
                Constants.showAlert(this.toastCtrl, "Server unavailable", "The server is temporarily unable to service your request due to maintenance downtime");
            });
    }

    checkTransaction(tx) {
        if (tx.confirmations < 6) {
            this.utx.push(tx);
        } else {
            this.ctx.push(tx);
        }
    }

    openTransactionInWebpage(hash: string) {
        this.clipboard.copy(this.networkAddress);
        Constants.showLongToastMessage("Transaction with hash " + hash + " copied.", this.toastCtrl);
    }

    initProps() {
        this.pageTitle = "Home";
        this.yourCashWalletText = "My Cash Wallet";
        this.clickToCopyText = "Click the address to copy it";
        this.accountBalanceText = "Account Balance";
        this.historyText = "History";
        this.cashSymbolText = "NGN";
        this.loadWalletText = "Fund Wallet";
        this.sellBitText = "Place Sell Order";

        let fees = Constants.getCurrentWalletProperties();
        this.currencyText = fees.currencyText;
        this.btcText = fees.btcText;
        this.yourBTCWalletText = "My Coin Wallet".replace('Coin', this.btcText);
        this.yourBTCWalletText = this.yourBTCWalletText.replace('/t*BTC/gi', this.btcText);
    }

    exchange(type) {
        this.getTransactions(false);
        if (type === 'Sell') {
            this.getTransactions(false);
            this.navCtrl.push('SellBitPage');
        } else {
            this.navCtrl.push('BuyBitPage');
        }
    }

    sellBit() {
        Console.log("sellBit");
        this.getTransactions(false);
        if (this.ls.getItem("bankCode") === "000" || this.ls.getItem('bankCode') === undefined) {
            Constants.showAlert(this.toastCtrl, "Feature Unavailable", "This feature is not available because you didn't provide bank details during registration.");
            return;
        } else if (this.ls.getItem("exchangeType") === 'exchange') {
            this.navCtrl.push('SellBitPage', { 'isOwner': true });
        } else {
            this.navCtrl.push('SellEquityPage', { 'isOwner': true });
        }
    }

    sellOrders() {
        this.navCtrl.push('MyOrdersPage');
    }
}
