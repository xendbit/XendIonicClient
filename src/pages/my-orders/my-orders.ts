
import { StorageService } from './../utils/storageservice';
import { Console } from './../utils/console';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';

/**
 * Generated class for the BuyBitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-my-orders',
    templateUrl: 'my-orders.html',
})
export class MyOrdersPage {

    currentWallet = {};
    usdRate: number = 0;
    btcRate: number = 0;
    btcToNgn = 0;

    ls: StorageService;
    loading: Loading;

    sellersText: string;
    sellers = [];
    priceText: string;
    buyerOtherAddress: string;
    currencyPairs = [];
    currencyPair: string;
    sellersPairs = [];
    fromCoin: string;
    toCoin: string;
    showHeaders = false;
    type = 'Sell';
    isSellEnabled = false;
    isBuyEnabled = true;
    lastValue: String;


    constructor(public loadingCtrl: LoadingController, public http: Http, public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public alertCtrl: AlertController) {
        let fees = Constants.getCurrentWalletProperties();
        this.currentWallet = fees;

        Console.log(fees);
        Console.log(this.currentWallet);
        this.loadRate();

        this.ls = Constants.storageService;

        //let pageTitle = "Select Payment Method";
        setTimeout(function () {
        }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
    }

    ionViewDidLoad() {
        Console.log('ionViewDidLoad BuyBitNgntPage');
    }

    ionViewDidEnter() {
        this.loadSellers();
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

    switchTo(type) {
        this.type = type;
        if (type === 'Sell') {
            this.isSellEnabled = false;
            this.isBuyEnabled = true;
        } else {
            this.isSellEnabled = true;
            this.isBuyEnabled = false;
        }

        this.pairSelected(this.lastValue);
    }

    pairSelected(value) {
        this.showHeaders = false;
        this.lastValue = value;
        Console.log("Selected Pair");
        let selectedPair = value;
        if (selectedPair !== undefined && selectedPair.indexOf("->") >= 0) {

            this.sellersPairs = [];
            for (let seller of this.sellers) {
                let splitted = selectedPair.split(" -> ");
                this.toCoin = splitted[1];
                this.fromCoin = splitted[0];

                if (this.type === 'Sell') {
                    if (seller.toCoin === this.toCoin) {
                        this.sellersPairs.push(seller);
                    }
                }
                if (this.type === 'Buy') {
                    if (seller.fromCoin === this.toCoin) {
                        this.sellersPairs.push(seller);
                    }
                }
            }

            this.showHeaders = this.sellersPairs.length > 0;
        }
    }

    loadSellers() {
        this.currencyPairs = [];
        this.sellersPairs = [];
        this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
        let wallets = Constants.properties['wallets'];
        for (let w in wallets) {
            let wallet = wallets[w];
            if (wallet['value'] !== Constants.WORKING_WALLET) {
                let pair = Constants.WORKING_WALLET + " -> " + wallets[w].value;
                this.currencyPairs.push(pair);
            }
        }

        for (let bpm of Constants.properties['payment.methods']) {
            let pair = Constants.WORKING_WALLET + " -> " + bpm.value;
            this.currencyPairs.push(pair);
        }

        Console.log(this.currencyPairs);

        let url = Constants.GET_USER_SELL_ORDERS_TX_URL;

        let postData = {
            emailAddress: this.ls.getItem("emailAddress"),
            password: this.ls.getItem("password")
        };

        this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
            this.sellers = responseData.result;
            this.loading.dismiss();
            if (this.currencyPair !== undefined && this.currencyPair !== "") {
                this.pairSelected(this.currencyPair);
            }
        }, _error => {
            this.loading.dismiss();
            Constants.showAlert(this.toastCtrl, "Server unavailable", "The server is temporarily unable to service your request due to maintenance downtime");
        });
    }

    finalizeSale(sellOrder) {
        Console.log('Sell Order: ' + sellOrder);
        Constants.properties['finalize_sale_order'] = sellOrder;
        this.navCtrl.push('ShowBankPaymentPage');
    }

    presentAlert(transactionId) {
        let alert = this.alertCtrl.create({
            title: 'Are you sure you want to delete this order?',
            subTitle: 'This process can not be reversed',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
                        let url = Constants.UPDATE_USER_SELL_ORDERS_TX_URL;
                        let postData = {
                            emailAddress: this.ls.getItem("emailAddress"),
                            sellOrderTransactionId: transactionId,
                            status: "delete",
                            password: this.ls.getItem("password")
                        };

                        this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
                            this.loading.dismiss();
                            let deletedId = responseData.result;
                            if (deletedId > 0) {
                                Constants.showLongToastMessage("Order Deleted Successfully", this.toastCtrl);
                                this.loadSellers();
                            } else {
                                Constants.showLongToastMessage("Error Deleting your order, please try again", this.toastCtrl)
                            }
                        }, _error => {
                            this.loading.dismiss();
                            Constants.showAlert(this.toastCtrl, "Server unavailable", "The server is temporarily unable to service your request due to maintenance downtime");
                        });
                    }
                }
            ]
        });
        alert.present();
    }

    deleteOrder(transactionId) {
        this.presentAlert(transactionId);
    }
}
