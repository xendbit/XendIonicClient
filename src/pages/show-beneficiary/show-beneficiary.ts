
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
  dataImage = "";
  loading: Loading;

  constructor(public platform: Platform, public nfc:NFC, public ndef: Ndef, public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public http: Http, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public storage: Storage, public toastCtrl: ToastController) {
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
      app.loadImage(app.beneficiary);
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  initializeNFC() {
    // if(this.platform.is('core') || this.platform.is('mobileweb')) {
    //   return;
    // }

    this.nfc.addNdefListener(() => {
      Console.log('successfully attached ndef listener');
    }, (err) => {
      Console.log('error attaching ndef listener: ');
      Console.log(err);
    }).subscribe((event) => {
      Console.log('received ndef message. the tag contains: ');
      Console.log(event.tag);
      Console.log('decoded tag id: ');
      Console.log(this.nfc.bytesToHexString(event.tag.id));

      try {
        Console.log(this.nfc.bytesToString(event.tag.ndefMessage[0].payload));
      } catch (err) {
        Console.log(err);
      }
    });

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

  __writeCard() {
    this.initializeNFC();
    let  value = this.beneficiary.passphrase;
    Console.log('Writing info to card: ' + value);
    let message = this.ndef.textRecord(value);
    this.nfc.write([message]).then((_success) => {
      Console.log("Write Successfully")
      Constants.showLongToastMessage("Card Written Successfully", this.toastCtrl);
    }).catch((_error) => {
      Console.log(_error);
    });
  }

  disposeDialog() {
    this.viewCtrl.dismiss();
  }

  loadImage(beneficiary) {
    Console.log("loadImage called");
    let url = Constants.GET_IMAGE_URL;
    let key = Constants.WORKING_WALLET + "Address";

    Console.log(beneficiary.proofOfIdentity);

    let requestData = {
      password: this.ls.getItem("password"),
      networkAddress: this.ls.getItem(key),
      emailAddress: this.ls.getItem("emailAddress"),
      idImage: beneficiary.proofOfIdentity
    }

    this.http.post(url, requestData, Constants.getHeader()).map(res => res.json()).subscribe(
      responseData => {
        this.dataImage = 'data:image/jpeg;base64,' + responseData.result;
      }, error => {
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      }
    )
  }


}
