import { StorageService } from '../utils/storageservice';
import { Constants } from '../utils/constants';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Loading, AlertController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { FormBuilder } from '@angular/forms';
import { Console } from '../utils/console';
import { Wallet } from '../utils/wallet';

/**
 * Generated class for the ExchangePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-token-search',
  templateUrl: 'token-search.html',
})
export class TokenSearchPage {

  ls: StorageService;
  loading: Loading;
  wallet: Wallet;
  tokens: any[];
  displayedTokens = undefined;
  searchTerm: string;
  param: string;
  maxShownTokens = 10;

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public http: Http, public formBuilder: FormBuilder, public toastCtrl: ToastController, public loadingCtrl: LoadingController) {
    this.ls = Constants.storageService;
    this.wallet = Constants.WALLET;
    this.param = this.navParams.get('param');
    this.ls.setItem('displayedTokens', []);
  }

  ionViewDidLoad() {
    this.displayedTokens = this.ls.getItem('displayedTokens');
  }

  ionViewDidEnter() {
    this.loadAllTokens();
  }

  selectToken(token) {
    if (this.param === 'from') {
      Constants.defiParams.from = token;
    } else {
      Constants.defiParams.to = token;
    }

    this.navCtrl.pop();
  }

  searchBar(input) {
    let searched = this.tokens.filter((value) => {
      return (
        value.symbol.toLowerCase().indexOf(this.searchTerm.toLowerCase()) >= 0 ||
        value.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) >= 0
      );
    });

    this.displayedTokens = searched.slice(0, this.maxShownTokens);    
  }

  loadAllTokens() {
    let showloading = false;
    if (this.displayedTokens === undefined) {
      showloading = true;
    }

    if (showloading) {
      this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    }

    const url = Constants.GET_TOKENS_URL;
    Console.log(url);
    this.http.get(url).map(res => res.json()).subscribe(responseData => {
      if (showloading) {
        this.loading.dismiss();
      }
      this.tokens = responseData.data;      
      this.tokens.unshift({
        symbol: 'ETH',
        name: 'Ethereum',
        address: '0x',
        logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
      });

      this.displayedTokens = this.tokens.slice(0, this.maxShownTokens);
      this.ls.setItem('displayedTokens', this.displayedTokens);
    }, error => {
      if (showloading) {
        this.loading.dismiss();
      }
      let errorBody = JSON.parse(error._body);
      Constants.showPersistentToastMessage(errorBody.error, this.toastCtrl);
    });
  }
}
