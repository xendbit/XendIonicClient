import { Subscription } from 'rxjs/Rx';
import { NFCHelper } from './../utils/nfc';
import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { Console } from './../utils/console';
import { Dialogs } from '@ionic-native/dialogs';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController, Loading, LoadingController } from 'ionic-angular';
import { NFC, Ndef } from '@ionic-native/nfc';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/**
 * Generated class for the SalePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sale',
  templateUrl: 'sale.html',
})
export class SalePage {

  selectedProducts = [];
  totalPrice = 0;
  totalQuantity = 0;
  total = 0;
  beneficiaryCode;
  beneficiaryPassword: string;
  loading: Loading;

  ls: StorageService;

  subscription: Subscription;


  constructor(public http: Http, public barcodeScanner: BarcodeScanner, public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public nfc: NFC, public ndef: Ndef, public dialog: Dialogs, public toastCtrl: ToastController, public loadingCtrl: LoadingController) {
    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SalePage');

    let productNames = Constants.otherData['productNames'];
    let productPrices = Constants.otherData['productPrices'];
    let productQuantities = Constants.otherData['productQuantities'];

    let product = {};

    for (let index in productNames) {
      let pn = productNames[index];

      let pp = +productPrices[index];
      let pq = +productQuantities[index];
      let pt = pp * pq;
      this.total += pt;
      this.totalPrice += pp;
      this.totalQuantity += pq;

      product = {
        'name': pn,
        'price': pp,
        'quantity': pq,
        'total': pt
      };

      this.selectedProducts.push(product);
    }
  }

  ionViewDidEnter() {
    this.initializeNFC();
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  initializeNFC() {
    this.subscription = NFCHelper.readNFC(this.platform, this.nfc).subscribe((res) => {
      this.beneficiaryCode = res;
      Constants.showLongToastMessage("Beneficiary Code Read Successfully", this.toastCtrl);
    });
  }

  async completeBuy() {
    // TODO: Discuss with Bolaji how we manage the below with the new 10K loan.
    // let max = 47500;
    // let min = 47000;
    // if(this.total > max) {
    //   Constants.showLongToastMessage("You have too many products added, remove some products. The maximum you can add is [NGN 47, 500]", this.toastCtrl);
    //   return;
    // }

    // if(this.total < min) {
    //   Constants.showLongToastMessage("You have too many products added, remove some products. The maximum you can add is [NGN 47, 500]", this.toastCtrl);
    //   return;
    // }

    let postData = {};

    console.log(Constants.otherData);
    let pn = Constants.otherData['productNames'].join(":");
    let pp = Constants.otherData['productPrices'].join(":");
    let pq = Constants.otherData['productQuantities'].join(":");
    postData['productNames'] = pn;
    postData['productPrices'] = pp;
    postData['productQuantities'] = pq;
    postData['totalPrice'] = this.totalPrice;
    postData['totalQuantity'] = this.totalQuantity;
    postData['grandTotal'] = this.total;
    postData['distributorCode'] = await this.ls.getItem("distributorCode");
    postData['beneficiaryCode'] = this.beneficiaryCode;
    postData['beneficiaryPassword'] = this.beneficiaryPassword;
    postData['password'] = this.beneficiaryPassword;

    console.log(postData);
    let url = Constants.BUY_PRODUCT_URL;

    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please wait...");
    this.http.post(url, postData, Constants.getWalletHeader("NGNC")).map(res => res.json()).subscribe(responseData => {
        this.loading.dismiss();
        if(responseData.response_text === 'error') {
          Constants.showLongerToastMessage(responseData.result, this.toastCtrl);
          return;
        }

        if (responseData.response_text === 'success') {
            Constants.showLongerToastMessage("Transaction Successful.", this.toastCtrl);
            //Go back to  products page
            this.navCtrl.popToRoot();
        }
    }, error => {
        this.loading.dismiss();
        Constants.showLongerToastMessage(error, this.toastCtrl);
    });
  }

  scanCode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      if (barcodeData.cancelled) {
        Constants.showLongerToastMessage('Barcode scanner cancelled', this.toastCtrl);
      } else {
        this.beneficiaryCode = barcodeData.text;
      }
    }, (_err) => {
      Constants.showLongerToastMessage('Error launching barcode scanner', this.toastCtrl);
    });
  }
}
