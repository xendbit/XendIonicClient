import { Console } from './../utils/console';
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


  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public http: Http) {
    this.historyText = "History";
    this.clipboard = new Clipboard();
    this.ls = Constants.storageService;
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
    Console.log(this.startDate.getTime());
    Console.log(this.endDate.getTime());
    this.getTransactions(true);
  }

  openTransactionInWebpage(hash: string) {
    this.clipboard.copy(hash);
    Constants.showLongToastMessage("Transaction with hash " + hash + " copied.", this.toastCtrl);
  }

  async getTransactions(showLoading) {
    let fees = Constants.getCurrentWalletProperties();
    Console.log(fees);
    if (showLoading) {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    }

    let key = Constants.WORKING_WALLET + "Address";

    let postData = {
      password: await this.ls.getItem("password"),
      networkAddress: await this.ls.getItem(key),
      emailAddress: await this.ls.getItem("emailAddress"),
      currencyId: fees.currencyId,
      equityId: fees.equityId,
    };

    Console.log(postData);
    let url = Constants.GET_TX_URL + this.startDate.getTime() + "/" + this.endDate.getTime();
    this.http.post(url, postData, Constants.getHeader())
      .map(res => res.json())
      .subscribe(async responseData => {
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
          this.networkAddress = await this.ls.getItem(key);
          for (let txData of responseData.result.transactions) {
            let tx = {
              tx: txData.hash,
              url: txData.url,
              value: txData.value,
              confirmations: txData.confirmations,
              incoming: txData.incoming,
              time: new Date(txData.time)
            }
            Console.log(tx);
            Console.log(new Date(txData.time));

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
