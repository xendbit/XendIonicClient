import { StorageService } from './../utils/storageservice';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { FormBuilder, Validators } from '@angular/forms';
import { Console } from './../utils/console';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, ActionSheetController, AlertController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';

/**
 * Generated class for the SellBitPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-sell-bit',
    templateUrl: 'sell-bit.html',
})
export class SellBitPage {

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
    banks = [];
    beneficiaryName: string;
    passwordText: string;
    placeOrderText: string;
    paymentMethods = [];
    isOwner = false;
    beneficiaryData = {
        beneficiaryBank: "",
        beneficiaryAccountNumber: ""
    };

    constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public http: Http, public formBuilder: FormBuilder, public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController) {
        this.banks = Constants.properties['banks'];
        this.paymentMethods = Constants.properties['payment.methods'];
        this.pageTitle = "Place Sell Order"
        this.priceText = "Price Per Coin";
        this.numberOfBTCText = "Number of Coins";
        this.sendBitText = "Place Sell Order";
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
            amountToRecieve: ['', Validators.required],
            beneficiaryAccountNumber: ['', Validators.required],
            beneficiaryBank: ['', Validators.required],
            password: ['', Validators.required],
            acceptedPaymentMethods: ['', Validators.required]
        });

        this.ls = Constants.storageService;
        this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
        let app = this;
        setTimeout(function () {
            //Wait for sometimes for storage to be ready
            app.loading.dismiss();

        }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
    }

    ionViewWillEnter() {
        this.isOwner = this.navParams.get('isOwner') === undefined ? false : true;
    }

    ionViewDidLoad() {
        Console.log('ionViewDidLoad SellBitPage');
        this.loadRate();
        this.loadBalanceFromStorage();
        this.populateBeneficiaryInformation();
    }

    populateBeneficiaryInformation() {
        this.sellForm.controls.beneficiaryAccountNumber.setValue(this.ls.getItem('accountNumber'));
        this.sellForm.controls.beneficiaryBank.setValue(this.ls.getItem("bank"));
    }

    sellBit() {
        let isValid = false;
        let sb = this.sellForm.value;
        let balance = +this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
        let price = +sb.pricePerBTC;
        let password = sb.password;
        let coinAmount = +sb.numberOfBTC;

        let fees = Constants.getCurrentWalletProperties();

        let xendFees = coinAmount * +fees.xendFees;
        let blockFees = fees.blockFees;

        if (coinAmount === 0) {
            Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
        } else if (!this.isOwner && sb.beneficiaryBank === "") {
            Constants.showLongToastMessage("Please select the beneficiary bank", this.toastCtrl);
        } else if (price === 0) {
            Constants.showLongToastMessage("Price must be greater than 0", this.toastCtrl);
        } else if (!this.isOwner && sb.beneficiaryAccountNumber === '') {
            Constants.showLongToastMessage("Please enter a valid beneficiary account number", this.toastCtrl);
        } else if (password !== this.ls.getItem("password")) {
            Constants.showLongToastMessage("Please enter a valid password.", this.toastCtrl);
        } else if (coinAmount + xendFees + blockFees > balance) {
            Constants.showPersistentToastMessage("Insufficient Coin Balance", this.toastCtrl);
        } else if (sb.acceptedPaymentMethods === "") {
            Constants.showPersistentToastMessage("Please specify accepted payment methods", this.toastCtrl);
        } else {
            isValid = true;
        }

        if (isValid) {
            let beneficiaryAccountNumber = this.isOwner ? this.ls.getItem('accountNumber') : sb.beneficiaryAccountNumber;
            let beneficiaryBank = this.isOwner ? this.ls.getItem('bankCode') : sb.beneficiaryBank;

            this.beneficiaryData.beneficiaryBank = beneficiaryBank;
            this.beneficiaryData.beneficiaryAccountNumber = beneficiaryAccountNumber;

            let data = {
                beneficiaryBank: beneficiaryBank,
                beneficiaryAccountNumber: beneficiaryAccountNumber
            }

            this.confirmBeneficiary(data);
        }
    }

    presentActionSheet(beneficiaryName) {
        let actionSheet = this.actionSheetCtrl.create({
            title: "Continue" + '?',
            buttons: [
                {
                    text: beneficiaryName,
                    handler: () => {
                        this.continue();
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

    confirmBeneficiary(data) {
        this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");

        let url = Constants.RESOLVE_ACCOUNT_URL;
        let postData = {
            bankCode: data.beneficiaryBank,
            accountNumber: data.beneficiaryAccountNumber
        };

        this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
            if (responseData.response_text === "success") {
                this.beneficiaryName = responseData.account_name;
                this.loading.dismiss();
                this.presentActionSheet(this.beneficiaryName);
            } else {
                Constants.showPersistentToastMessage("Can not confirm beneficiary account number.", this.toastCtrl);
                this.loading.dismiss();
            }
        }, error => {
            this.loading.dismiss();
            Constants.showAlert(this.toastCtrl, "Server unavailable", "The server is temporarily unable to service your request due to maintenance downtime");
        });
    }

    continue() {
        this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
        let sb = this.sellForm.value;
        let coinAmount = +sb.numberOfBTC;
        let beneficiaryAccountNumber = this.beneficiaryData.beneficiaryAccountNumber;
        let beneficiaryBank = this.beneficiaryData.beneficiaryBank;
        let password = sb.password;
        let amountToRecieve = +sb.amountToRecieve;

        let rate = +sb.pricePerBTC;

        let fees = Constants.getCurrentWalletProperties();

        let btcValue = coinAmount;

        let key = Constants.WORKING_WALLET + "Address";
        let sellerFromAddress = this.ls.getItem(key);
        let sellerToAddress = beneficiaryBank + ":" + beneficiaryAccountNumber;

        let postData = {
            amountToSell: btcValue,
            amountToRecieve: amountToRecieve,
            sellerFromAddress: sellerFromAddress,
            sellerToAddress: sellerToAddress,
            fromCoin: Constants.WORKING_WALLET,
            toCoin: sb.acceptedPaymentMethods.toString(),
            rate: rate,
            emailAddress: this.ls.getItem("emailAddress"),
            password: password,
            networkAddress: sellerFromAddress,
            currencyId: fees.currencyId,
            equityId: fees.equityId
        }

        //this is wrong
        let url = Constants.POST_TRADE_URL;

        this.http.post(url, postData, Constants.getHeader()).map(res => res.json()).subscribe(responseData => {
            this.clearForm();
            this.loading.dismiss();
            if (responseData.response_text === "success") {
                Constants.showPersistentToastMessage("Your sell order has been placed. It will be available in the market place soon", this.toastCtrl);
                Constants.properties['selectedPair'] = Constants.WORKING_WALLET + " -> Naira";
                this.navCtrl.push('MyOrdersPage');
            } else {
                Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);
            }
        }, error => {
            this.loading.dismiss();
            Constants.showAlert(this.toastCtrl, "Server unavailable", "The server is temporarily unable to service your request due to maintenance downtime");
        });
    }

    sellAll() {
        let fees = Constants.getCurrentWalletProperties();
        let balance = this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
        let xendFees = +fees.xendFees * balance;
        //0.001 is added because of rounding issues.
        Console.log("confirmedAccountBalance: " + balance);
        let canSend = balance - fees.blockFees - xendFees;
        if (canSend < 0) {
            canSend = 0;
        }

        this.sellForm.controls.numberOfBTC.setValue(canSend);
        this.sellForm.controls.amountToRecieve.setValue(this.sellForm.value.pricePerBTC * canSend);
    }

    sellBitFingerprint() {
        let faio: FingerprintAIO = new FingerprintAIO();
        faio.show({
            clientId: "Fingerprint-Demo",
            clientSecret: "password", //Only necessary for Android
            disableBackup: true  //Only for Android(optional)
        })
            .then((result: any) => {
                this.sellForm.controls.password.setValue(this.ls.getItem("password"));
                this.sellBit();
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
            this.btcToNgn = this.btcRate / this.usdRate;
            this.sellForm.controls.pricePerBTC.setValue(this.btcToNgn);
        }, error => {
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

    clearForm() {
        //this.sellForm.controls.pricePerBTC.setValue("");
        this.sellForm.controls.numberOfBTC.setValue("");
        this.sellForm.controls.password.setValue("");
    }

    calculateHowMuchToRecieve() {
        this.rate = this.sellForm.value.pricePerBTC;
        let toSell = +this.sellForm.value.numberOfBTC;
        if (this.rate !== 0 && toSell !== 0) {
            let toRecieve = toSell * this.rate;
            this.sellForm.controls.amountToRecieve.setValue(toRecieve.toFixed(3));
        }
    }
}
