import { StorageService } from '../utils/storageservice';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { FormBuilder, Validators } from '@angular/forms';
import { Console } from '../utils/console';
import { Constants } from '../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, ActionSheetController, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';

/**
 * Generated class for the BuyCustomPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-buy-custom',
    templateUrl: 'buy-custom.html',
})
export class BuyCustomPage {

    networkAddress: string;
    confirmedAccountBalance: string;
    ls: StorageService;
    sellForm: any;
    loading: Loading;
    usdRate: number = 0;
    btcRate: number = 0;
    btcToNgn = 0;
    pageTitle: string;
    btcText: string;
    currencyText: string;
    rate = 1;

    priceText: string;
    numberOfBTCText: string;
    sendBitText: string;
    beneficiaryNameText: string;
    beneficiaryAccountNumberText: string;
    beneficiaryBankText: string;
    xendBanks = [];
    beneficiaryName: string;
    passwordText: string;
    placeOrderText: string;
    bankData = {
        bank: "",
        accountNumber: "",
        name: ""
    };
    hmcws = 0;

    totalCost = 0.0;
    referenceCode = "";

    constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public http: Http, public formBuilder: FormBuilder, public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController) {
        this.xendBanks = Constants.properties['xend.banks']
        this.pageTitle = "Place Buy Order"
        this.priceText = "Price Per Coin";
        this.numberOfBTCText = "Number of Coins";
        this.sendBitText = "Place Buy Order";
        this.placeOrderText = "Place Order";
        this.beneficiaryNameText = "Beneficiary Name";
        this.beneficiaryAccountNumberText = "Beneficiary Account Number";
        this.beneficiaryBankText = "Beneficiary Bank";
        this.passwordText = "Wallet Password";

        let fees = Constants.getCurrentWalletProperties();
        this.currencyText = fees.currencyText;
        this.btcText = fees.btcText;
        this.priceText = this.priceText.replace('Coin', this.btcText);
        this.numberOfBTCText = this.numberOfBTCText.replace('Coin', this.btcText);

        this.sellForm = this.formBuilder.group({
            numberOfBTC: ['', Validators.required],
            pricePerBTC: ['', Validators.required],
            nairaValue: ['', Validators.required],
            beneficiaryBank: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.referenceCode = Constants.makeReference();
        this.ls = Constants.storageService;
        this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
        let app = this;
        setTimeout(function () {
            //Wait for sometimes for storage to be ready
            app.loading.dismiss();
        }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
    }

    ionViewDidLoad() {
        Console.log('ionViewDidLoad BuyCustomPage');
        this.loadRate();
        this.loadBalanceFromStorage();
        this.howMuchCanWeSell();
    }

    bankSelected(selectedBank) {
        Console.log(selectedBank);
        for (let xendBank of this.xendBanks) {
            if (xendBank.bank_name === selectedBank) {
                this.bankData.accountNumber = xendBank.account_number;
                this.bankData.bank = xendBank.bank_name;
                this.bankData.name = xendBank.account_name;
            }
        }

        Console.log(this.bankData);
    }

    buyBit() {
        let isValid = false;
        let sb = this.sellForm.value;
        let price = +sb.pricePerBTC;
        let password = sb.password;
        let coinAmount = +sb.numberOfBTC;

        let fees = Constants.getCurrentWalletProperties();
        if (coinAmount === 0) {
            Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
        } else if (price === 0) {
            Constants.showLongToastMessage("Price must be greater than 0", this.toastCtrl);
        } else if (password !== this.ls.getItem("password")) {
            Constants.showLongToastMessage("Please enter a valid password.", this.toastCtrl);
        } else if (this.bankData.bank === "") {
            Constants.showLongToastMessage("Please select a bank", this.toastCtrl);
        } else if(coinAmount > this.hmcws){
            Constants.showLongToastMessage("You can not buy more than " + this.hmcws.toFixed(3) + " " + this.btcText, this.toastCtrl);
        } else {
            isValid = true;
        }

        let key = Constants.WORKING_WALLET + "Address";
        let buyerToAddress = this.ls.getItem(key);
        let sellerToAddress = this.bankData.accountNumber + ":" + this.bankData.bank;

        if (isValid) {
            this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
            let postData = {
                amountToRecieve: coinAmount,
                amountToSell: this.totalCost,
                buyerToAddress: buyerToAddress,
                sellerToAddress: sellerToAddress,
                rate: price,
                emailAddress: this.ls.getItem("emailAddress"),
                password: password,
                sellOrderTransactionId: this.referenceCode,
            }

            Console.log(postData)

            let url = Constants.BUY_CUSTOM_URL;
            this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {

                this.loading.dismiss();
                if (responseData.response_text === "success") {
                    this.sellForm.controls.numberOfBTC.setValue("");
                    this.sellForm.controls.nairaValue.setValue("");
                    this.sellForm.controls.password.setValue("");
                    this.totalCost = 0;
                    this.referenceCode = Constants.makeReference();
                    Constants.showPersistentToastMessage("Your buy order has been placed. You will get your coins once the payment has been confirmed", this.toastCtrl);
                    this.howMuchCanWeSell();
                } else {
                    Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);
                }

            }, _error => {
                this.loading.dismiss();
                Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
            });

        }
    }

    howMuchCanWeSell() {
        let fees = Constants.getCurrentWalletProperties();
        let tickerSymbol = fees.tickerSymbol;
        let url = Constants.HOW_MUCH_CAN_WE_SELL_URL + "/" + tickerSymbol;
        this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(
            responseData => {
                if (responseData.response_text === "success") {
                    this.hmcws = +responseData.result;
                } else {
                    Constants.showAlert(this.toastCtrl, "An Error Occured", responseData.result);
                }
            },
            _error => {
                Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
            }
        );
    }

    buyBitFingerprint() {
        let faio: FingerprintAIO = new FingerprintAIO();
        faio.show({
            clientId: "XendFi",
            clientSecret: "password", //Only necessary for Android
            disableBackup: true  //Only for Android(optional)
        })
            .then((result: any) => {
                this.sellForm.controls.password.setValue(this.ls.getItem("password"));
                this.buyBit();
            })
            .catch((error: any) => {
                Constants.showLongToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
            });
    }

    loadRate() {
        let fees = Constants.getCurrentWalletProperties();
        let tickerSymbol = fees.tickerSymbol;
        let url = Constants.GET_USD_RATE_URL + tickerSymbol;

        this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
            this.usdRate = responseData.result.buy;
            this.btcRate = responseData.result.rate;
            Constants.LAST_USD_RATE = this.btcRate;
            this.btcToNgn = this.btcRate * this.usdRate;
            this.sellForm.controls.pricePerBTC.setValue(this.btcToNgn.toFixed(4));
        }, _error => {
            //doNothing
        });
    }

    loadBalanceFromStorage() {
        let key = Constants.WORKING_WALLET + "Address";
        this.networkAddress = this.ls.getItem(key);
        if (this.networkAddress !== null) {
            this.confirmedAccountBalance = this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
        }
    }

    calculateHowMuchToRecieve() {
        this.rate = this.sellForm.value.pricePerBTC;
        let toSell = +this.sellForm.value.numberOfBTC;
        if (this.rate !== 0 && toSell !== 0) {
            let toRecieve = toSell * this.rate;
            this.totalCost = toRecieve;
            this.sellForm.controls.nairaValue.setValue(toRecieve.toFixed(3));
        }
    }
}
