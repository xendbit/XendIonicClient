import { NFCHelper } from './../utils/nfc';

import { StorageService } from './../utils/storageservice';
import { Console } from './../utils/console';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, Loading, LoadingController, AlertController, ViewController, IonicPage, ToastController, Platform } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { NFC, Ndef } from '@ionic-native/nfc';

/**
 * Generated class for the ShowBeneficiaryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-show-beneficiary',
  templateUrl: 'show-beneficiary.html',
})
export class ShowBeneficiaryPage {

  ls: StorageService;
  dateRegistered = "";
  beneficiary;
  idi = "";
  pdi = "";
  loading: Loading;

  constructor(public platform: Platform, public nfc: NFC, public ndef: Ndef, public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public http: Http, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public storage: Storage, public toastCtrl: ToastController) {
    this.beneficiary = Constants.registrationData['beneficiary'];
    Console.log(this.beneficiary);
    this.dateRegistered = new Date(this.beneficiary.dateRegistered).toLocaleString();
    Console.log(this.dateRegistered);

    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
      app.loadImages(app.beneficiary);
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad ShowBeneficiaryPage');
  }

  makeDonation() {
    Console.log('makeDonation');
    this.viewCtrl.dismiss();
    Constants.registrationData['viewBeneficiaries'].navCtrl.push('SendBitPage');
  }

  collectPayment() {
    Console.log("Collect Payment");
    this.navCtrl.push('CollectPaymentPage');
  }

  writeCard() {
    let value = this.beneficiary.passphrase;
    NFCHelper.writeNFC(value, this.platform, this.nfc, this.ndef).then(_res => {
      Constants.showLongToastMessage("Card Written Successfully", this.toastCtrl);
    });
  }

  disposeDialog() {
    this.viewCtrl.dismiss();
  }

  loadIdImage(code) {
    Console.log("load ID Image called");
    let url = Constants.GET_IMAGE_URL + "/" + code;

    Console.log(url);

    this.http.get(url, Constants.getHeader()).map(res => res.json()).subscribe(
      responseData => {
        this.idi = 'data:image/jpeg;base64,' + responseData.result;
      }, _error => {
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      }
    );
  }

  loadBeneficiaryImage(code) {
    Console.log("load Photo Image called");
    let url = Constants.GET_IMAGE_URL + "/" + code;
    Console.log(url);
    this.http.get(url, Constants.getHeader()).map(res2 => res2.json()).subscribe(
      responseData2 => {
        this.pdi = 'data:image/jpeg;base64,' + responseData2.result;
      }, _error => {
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      }
    )

  }

  loadImages(beneficiary) {
    Console.log("Loading Images");
    setTimeout(() => {
      this.loadBeneficiaryImage(beneficiary.photoImage);
    }, 1000);
    setTimeout(() => {
      this.loadIdImage(beneficiary.proofOfIdentity);
    }, 1000);

  }
}
