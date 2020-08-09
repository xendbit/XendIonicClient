import { FormBuilder, Validators } from "@angular/forms";
import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

/**
 * Generated class for the CollectPaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-collect-payment',
  templateUrl: 'collect-payment.html',
})

export class CollectPaymentPage {
  collectPageForm;

  constructor(public formBuilder: FormBuilder, public navCtrl: NavController, public navParams: NavParams) {
    this.collectPageForm = this.formBuilder.group({
      amount: ['', Validators.required],
      userCode: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CollectPaymentPage');
  }

}
