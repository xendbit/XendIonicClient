import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import {Console} from '../utils/console';
import { NavController, NavParams, IonicPage } from 'ionic-angular';


/*
  Generated class for the Warning page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-warning',
  templateUrl: 'warning.html'
})
export class WarningPage {

 pageTitle: string;
 imReadyText: string;
 warning1Text: string;
 warning2Text: string;
 warning3Text: string;
 warning4Text: string;
 takeNoteText: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.pageTitle = "Warning!!!";
    this.imReadyText = "I'm Ready";
    this.warning1Text = "On the next page, we will show you your Passphrase. Get a pen and paper and write it down.";
    this.warning2Text = "You must not lose it.";
    this.warning3Text = "In case you lose your phone, or want to migrate this wallet to another device, you will need the Passphrase.";
    this.warning4Text = "DO NOT LOSE OR FORGET YOUR PASSPHRASE";
    this.takeNoteText = Constants.properties['take.not'];
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad WarningPage');
  }

  ready() {
   this.navCtrl.push('CreateMnemonicPage', { 'mnemonic': '', 'shouldRegister': false, 'fromTabs': false }); 
  }

}
