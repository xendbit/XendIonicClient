import { Constants } from './../utils/constants';
import { Clipboard } from '@ionic-native/clipboard';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Loading, LoadingController } from 'ionic-angular';
import { StorageService } from '../utils/storageservice';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
/**
 * Generated class for the HistoryPage page.
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

  networkAddress: string;
  startDate: Date;
  endDate: Date;
  historyText: string;
  private clipboard: Clipboard;
  loading: Loading;
  ls: StorageService;
  utx: any = [];
  ctx: any = [];
  confirmedAccountBalance;
  totalReceived;
  totalSent;
  escrow;
  wallet = undefined;


  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public http: Http) {
    this.historyText = "History";
    this.clipboard = new Clipboard();
    this.ls = Constants.storageService;

    this.wallet = Constants.WALLET;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HistoryPage');
  }

  ionViewDidEnter() {
    let twentyFourHours = 60 * 60 * 1000 * 24;
    this.startDate = new Date();
    this.endDate = new Date();
    this.startDate.setTime(this.endDate.getTime() - twentyFourHours);

    this.getTransactions(true);
  }

  loadTransactions() {
    this.startDate = new Date(this.startDate);
    this.endDate = new Date(this.endDate);
    this.getTransactions(true);
  }

  openTransactionInWebpage(hash: string) {
    this.clipboard.copy(hash);
    Constants.showLongToastMessage("Transaction with hash " + hash + " copied.", this.toastCtrl);
  }

  getTransactions(showLoading) {
    if (showLoading) {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    }

    let postData = {
      password: this.ls.getItem("password"),
      networkAddress: this.wallet['chain_address'],
      emailAddress: this.ls.getItem("emailAddress"),
    };

    let url = Constants.GET_TX_URL + this.startDate.getTime() + "/" + this.endDate.getTime();
    this.http.post(url, postData, Constants.getHeader())
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
          this.ls.setItem(Constants.WORKING_WALLET + "confirmedAccountBalance", responseData.result.balance);
          this.totalReceived = responseData.result.received
          this.totalSent = responseData.result.spent

          this.escrow = responseData.result.escrow === 0 ? 0 : (responseData.result.escrow)

          this.networkAddress = this.wallet['chain_address'];
          for (let txData of responseData.result.transactions) {
            let tx = {
              tx: txData.hash,
              url: txData.url,
              value: txData.value,
              confirmations: txData.confirmations,
              incoming: txData.incoming,
              time: new Date(txData.time)
            }

            this.checkTransaction(tx);
          }
        }
      }, _error => {
        if (showLoading) {
          this.loading.dismiss();
        }
        Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
      });
  }

  checkTransaction(tx) {
    if (tx.confirmations < 6) {
      this.utx.push(tx);
    } else {
      this.ctx.push(tx);
    }
  }
}
