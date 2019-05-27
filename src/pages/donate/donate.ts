import {CoinsSender} from './../utils/coinssender';
import {Console} from './../utils/console';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {FingerprintAIO} from '@ionic-native/fingerprint-aio';
import {Constants} from './../utils/constants';
import {StorageService} from './../utils/storageservice';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Component} from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, ToastController, AlertController, IonicPage } from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

/**
 * Generated class for the DonatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-donate',
    templateUrl: 'donate.html',
})
export class DonatePage {

    donateForm: FormGroup;
    loading: Loading;
    ls: StorageService;

    sendBitWarningText: string;
    amountToSendText: string;
    bitcoinAddressText: string;
    scanCodeText: string;
    passwordText: string;
    sendBitText: string;
    btcText: string;
    howMuchCanISendText: string;
    currencyText: string;
    beneficiary;
    toBitcoinAddress: string;
    hmcisWarning: string;
    disableButton = false;

    constructor(public http: Http, public barcodeScanner: BarcodeScanner, public formBuilder: FormBuilder, public navCtrl: NavController, public navParams: NavParams,  public loadingCtrl: LoadingController, public toastCtrl: ToastController, public alertCtrl: AlertController) {
        this.donateForm = formBuilder.group({
            amount: ['', Validators.compose([Validators.required])],
            networkAddress: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.beneficiary = Constants.registrationData['beneficiary'];
        this.sendBitWarningText = "Please make sure the bitcoin address you will enter below is correct. Once you send your bits, the transaction can not be reversed.";
        this.amountToSendText = "Amount to Send";
        this.bitcoinAddressText = "Bitcoin Address";
        this.scanCodeText = "Scan Address";
        this.passwordText = "Password";
        this.sendBitText = "Xend Bit";
        this.btcText = "BTC";
        this.howMuchCanISendText = "How much can I send?";
        this.hmcisWarning = "This is only an optimistic estimate depending on how much the block fee is, your charges may be less or more than we estimated.";


        this.ls = Constants.storageService;
        this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
        let app = this;
        setTimeout(function () {
            //Wait for sometimes for storage to be ready
            app.loading.dismiss();
        }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
    }

    ionViewDidLoad() {
        Console.log('ionViewDidLoad DonatePage');
    }

    ionViewDidEnter() {
        let fees = Constants.getCurrentWalletProperties();

        this.btcText = fees.btcText;
        this.currencyText = fees.currencyText;
        this.sendBitWarningText = this.sendBitWarningText.replace('bitcoin', this.currencyText)
        this.bitcoinAddressText = this.bitcoinAddressText.replace('Bitcoin', this.currencyText);
    }

    sendBit() {
        let isValid = false;
        let bv = this.donateForm.value;
        let amountToSend = +bv.amount;
        let balance = +this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
        let password = bv.password;
        let toBitcoinAddress = bv.networkAddress;

        let fees = Constants.getCurrentWalletProperties();
        let xendFees = amountToSend * +fees.xendFees;

        let invalidAddressMessage = "Invalid Coin Address detected".replace("Coin", fees.currencyText);

        if (amountToSend === 0) {
            Constants.showLongToastMessage("Amount must be greater than 0", this.toastCtrl);
        } else if (amountToSend + fees.blockFees + xendFees > balance) {
            Constants.showPersistentToastMessage("Insufficient Coin Balance", this.toastCtrl);
        } else if (toBitcoinAddress === '') {
            Constants.showPersistentToastMessage(invalidAddressMessage, this.toastCtrl);
        } else if (password !== this.ls.getItem("password")) {
            Constants.showLongToastMessage("Please enter a valid password.", this.toastCtrl);
        } else if (this.donateForm.valid) {
            isValid = true;
        }

        if (isValid) {
            let data = {};
            data['amount'] = amountToSend
            data['recipientAddress'] = toBitcoinAddress;
            data['loading'] = this.loading;
            data['loadingCtrl'] = this.loadingCtrl;
            data['ls'] = this.ls;
            data['toastCtrl'] = this.toastCtrl;
            data['http'] = this.http;
            data['sendBitPage'] = this;
            data['alertCtrl'] = this.alertCtrl;

            this.disableButton = true;
            if (fees.btcText.indexOf('ETH') >= 0) {
                CoinsSender.sendCoinsEth(data, this.sendCoinsSuccess, this.sendCoinsError, Constants.WORKING_WALLET);
            } else if (fees.btcText.indexOf('XND') >= 0 || fees.btcText.indexOf('NXT') >= 0 || fees.btcText.indexOf('ARDOR') >= 0 || fees.btcText.indexOf('IGNIS') >= 0) {
                CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError, fees);
            } else if (fees.currencyId !== undefined) {
                CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError, fees);
            } else if (fees.equityId !== undefined) {
                CoinsSender.sendCoinsXnd(data, this.sendCoinsSuccess, this.sendCoinsError, fees);
            } else {
                let key = Constants.WORKING_WALLET + "Address";
                CoinsSender.sendCoinsBtc(data, this.sendCoinsSuccess, this.sendCoinsError, Constants.WORKING_WALLET, this.ls.getItem(key), Constants.NETWORK);
            }
        }
    }

    sendCoinsSuccess(data) {
        Console.log("Success Code Called");
        let me: DonatePage = data['sendBitPage'];
        console.dir(data);
        console.dir(me);
        me.donateForm.controls.amount.setValue("");
        me.donateForm.controls.networkAddress.setValue("");
        me.donateForm.controls.password.setValue("");
    }

    sendCoinsError(data) {
        let me: DonatePage = data['sendBitPage'];
        me.disableButton = false;
        Constants.showLongerToastMessage('Error Sending Coin', me.toastCtrl);
        Console.log("Errored Out");
    }

    askBeneficiaryForAddress() {
        let ws = Constants.properties['ws_connection'];

        let data = {
            "donorEmailAddress": this.ls.getItem("emailAddress"),
            "beneficiaryEmailAddress": this.beneficiary.emailAddress,
            "coin": Constants.WORKING_WALLET,
            "action": "askBeneficiaryForAddress"
        };

        ws.send(Constants.encryptData(JSON.stringify(data))).subscribe((data) => {
        }, (error) => {
        }, () => {
        });

        Constants.properties['donatePage'] = this;
        Constants.showAlert(this.toastCtrl, "Contacting Beneficiary", "Please wait while we contact the beneficiary. You can close this window.");
    }

    sendBitFingerprint() {
        let faio: FingerprintAIO = new FingerprintAIO();
        faio.show({
            clientId: "XendBit",
            clientSecret: "password", //Only necessary for Android
            disableBackup: true  //Only for Android(optional)
        })
            .then((result: any) => {
                this.donateForm.controls.password.setValue(this.ls.getItem("password"));
                this.sendBit();
            })
            .catch((error: any) => {
                //doNothing
                Console.log(error);
                Constants.showLongToastMessage("Fingerprint Device Not Found.", this.toastCtrl);
            });
    }

    howMuchCanISend() {
        let fees = Constants.getCurrentWalletProperties();
        let balance = +this.ls.getItem(Constants.WORKING_WALLET + "confirmedAccountBalance");
        //0.001 is added because of rounding issues.
        let canSend = balance - +fees.blockFees;
        if (canSend < 0) {
            canSend = 0;
        }
        Constants.showAlert(this.toastCtrl, this.howMuchCanISendText, canSend.toFixed(3));
    }

    scanCode() {
        let app = this;
        this.barcodeScanner.scan().then((barcodeData) => {
            if (barcodeData.cancelled === false) {
                app.donateForm.controls.networkAddress.setValue(barcodeData.text);
            } else {
                Constants.showLongerToastMessage('Barcode scanner cancelled', this.toastCtrl);
            }
        }, (err) => {
            Constants.showLongerToastMessage('Error launching barcode scanner', this.toastCtrl);
        });
    }
}
