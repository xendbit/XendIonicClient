import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { NavController, NavParams, Loading, LoadingController, IonicPage } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Constants } from '../utils/constants';

declare var genwallet: any;
/*
  Generated class for the CreateMnemonic page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-create-mnemonic',
  templateUrl: 'create-mnemonic.html'
})

export class CreateMnemonicPage {

  mnemonic: string;
  fullMnemonic: string;
  pageTitle: string;
  iveWrittenItText: string;
  warning1Text: string;
  warning2Text: string;
  warning3Text: string;
  loading: Loading;


  constructor(public http: Http, public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController) {
    this.pageTitle = "See The Passphrase";
    this.iveWrittenItText = "I've Written It Down";
    this.warning1Text = "Take a pen and a paper and carefully write down the Passphrase in bold below. You must not lose or forget them.";
    this.warning2Text = "Don't Email Them";
    this.warning3Text = "Write Them on Paper";
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad CreateMnemonicPage');
    this.generateMnemonic();
  }


  generateMnemonic() {
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let generateAnotherMnemonic = true;
    while (generateAnotherMnemonic) {
      let result = genwallet();
      console.dir(result);
      let splitted = result.mnemonic.split(" ").splice(0, 12);
      let wordCount = {};
      generateAnotherMnemonic = false;
      for (let x of splitted) {
        let count = wordCount[x];
        if (count === undefined) {
          wordCount[x] = 1;
        } else {
          //if it's not undefined, then we have duplicate word, so generate another
          generateAnotherMnemonic = true;
          break;
        }
      }

      let postData = {
        passphrase: result.mnemonic
      };

      this.http.post(Constants.GET_13TH_WORD, postData, Constants.getHeader()).map(res => res.json()).subscribe(
        responseData => {
          this.loading.dismiss();
          if (responseData.response_code == 0) {
            let lastWord = responseData.result;
            this.fullMnemonic = result.mnemonic + " " + lastWord;
            this.mnemonic = splitted.join(' ');
            Console.log(this.fullMnemonic);
            Console.log(this.mnemonic);
          } else {
            throw(responseData.response_text);
          }
        },
        error => {
          this.loading.dismiss();
          throw (error);
        }
      );
    }
  }

  confirmMnemonic() {
    this.navCtrl.push('ConfirmMnemonicPage', { 'mnemonic': this.fullMnemonic, 'shouldRegister': 'true', type: 'new' });
  }
}
