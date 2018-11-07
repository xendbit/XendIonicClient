import { Component } from '@angular/core';
import {Console} from '../utils/console';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { Http } from '@angular/http';

/*
  Generated class for the Terms page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-terms',
  templateUrl: 'terms.html'
})

export class TermsPage {

 iAcceptText: string;
 pageTitle: string;

  constructor(public http:Http, public navCtrl: NavController, public navParams: NavParams) {
    this.iAcceptText = "I Accept";
    this.pageTitle = "Terms and Agreement";
   }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad TermsPage');    
  }

  acceptTermsAndAgreement() {
    this.navCtrl.push('GettingStartedPage');         
  }
}
