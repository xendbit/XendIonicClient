import { Constants } from '../utils/constants';
import { Component } from '@angular/core';
import { Loading, LoadingController, ToastController, IonicPage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { Wallet } from '../utils/wallet';
import { Clipboard } from '@ionic-native/clipboard';
import { StorageService } from '../utils/storageservice';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the BuyBitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage {
  loading: Loading;

  wallet: Wallet;
  txs = [];
  private clipboard: Clipboard;
  ls: StorageService;

  constructor(public loadingCtrl: LoadingController, public http: Http, public toastCtrl: ToastController, private storage: Storage) {
    this.wallet = Constants.WALLET;
    this.clipboard = new Clipboard();
    this.ls = new StorageService(this.storage);
    setTimeout(function () {
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  ionViewDidLoad() {
  }

  ionViewDidLeave() {
  }

  ionViewDidEnter() {
    this.wallet = Constants.WALLET;
    this.loadHistory();
  }

  loadHistory() {
    let url = Constants.HISTORY_URL + this.ls.getItem("userId") + "/" + this.wallet.chain;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    this.http.get(url).map(res => res.json()).subscribe(responseData => {
      this.loading.dismiss();
      if (responseData.status === 'success') {
        this.txs = responseData.data;
      }
    }, error => {
      this.loading.dismiss();
      let errorBody = JSON.parse(error._body);
      Constants.showPersistentToastMessage(errorBody.error, this.toastCtrl);
    });
  }

  copyHash(tx) {
    this.clipboard.copy(tx.hash);
    let message = "Transaction Hash Copied: " + tx.hash;
    Constants.showToastMessage(message, this.toastCtrl);    
  }
}
