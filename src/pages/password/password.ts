import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { Component } from '@angular/core';
import { Console } from '../utils/console';
import { NavController, NavParams, ToastController, IonicPage, Loading, LoadingController, AlertController } from 'ionic-angular';
import { Constants } from '../utils/constants';
import { StorageService } from '../utils/storageservice';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';

/*
  Generated class for the Pin page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-password',
  templateUrl: 'password.html'
})
export class PasswordPage {

  allnumbers = [];
  password = "";
  masked = ""
  confirmPassword;
  displayed = "";
  numbers = [];
  pageTitle: string;
  passwordWarningText: string;
  completeRegistrationText: string;
  enterPasswordText: string;
  importantNoticeText: string;
  disableButton: boolean = true;
  ls: StorageService;
  PASSWORD_LEN = 4;

  isBeneficiary = false;
  isLogin = false;
  isAgentRegister = false;
  loading: Loading;
  title = "Please enter your pin"
  showOrHideText = "Show";

  rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['DEL', '0', 'CLS']
  ]

  constructor(public toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams, public http: Http, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    this.pageTitle = "Enter Your PIN";
    this.passwordWarningText = "Please Select Your PIN.";
    this.completeRegistrationText = "Complete Registration";

    this.ls = Constants.storageService;
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad PasswordPage');
    this.isBeneficiary = Constants.otherData['is_beneficiary'];
    this.isLogin = Constants.otherData['is_login'];
    this.isAgentRegister = Constants.otherData['is_agent_register'];
    Console.log(this.isLogin);
    if (this.isLogin) {
      this.pageTitle = "Enter Your Pin to Login";
      this.title = "Login Here";
    }
  }

  isEnabled(val) {
    if (val === 'DEL' || val === 'CLS') {
      return false;
    } else {
      if (this.password.length === this.PASSWORD_LEN) {
        this.disableButton = false;
        return true;
      } else {
        this.disableButton = true;
      }
    }
  }

  showOrHide() {
    if (this.showOrHideText === "Hide") {
      this.showOrHideText = "Show";
      this.masked = "";
      for (let i = 0; i < this.password.length; i++) {
        this.masked += "X";
      }
    } else {
      this.showOrHideText = "Hide";
      this.masked = this.password;
    }
    console.log(this.masked, this.showOrHideText);
  }

  clicked(val) {
    if (val === 'DEL') {
      if (this.password !== "") {
        this.password = this.password.substr(0, (this.password.length - 1));
      }
    } else if (val === 'CLS') {
      this.password = "";
    } else {
      this.password += val;
    }

    if (this.showOrHideText === "Hide") {
      this.masked = this.password;
    } else {
      this.masked = "";
      for (let i = 0; i < this.password.length; i++) {
        this.masked += "X";
      }
    }
  }

  registerBeneficiary() {
    Console.log("Register Clicked");
    Constants.registerBeneficiary();
  }

  loginWithPrint() {
    let ls = this.ls;
    let faio: FingerprintAIO = new FingerprintAIO();
    faio.show({
      clientId: "XendBit",
      clientSecret: "password", //Only necessary for Android
      disableBackup: false  //Only for Android(optional)
    })
      .then((result: any) => {
        this.password = ls.getItem("password");
        this.login();
      })
      .catch((error: any) => {
        Console.log(error);
        Constants.showLongToastMessage("Biometric Login can not be used at this time.", this.toastCtrl);
      });
  }


  login() {
    let url = Constants.LOGIN_URL;
    let ls = this.ls;
    let mnemonicCode = Constants.normalizeMnemonicCode(ls);

    let requestData = {
      emailAddress: this.ls.getItem("emailAddress"),
      password: this.password,
      passphrase: mnemonicCode
    };

    this.http.post(url, requestData, Constants.getHeader())
      .map(res => res.json())
      .subscribe(responseData => {
        if (responseData.response_text === "success") {
          this.loading.dismiss();
          let user = responseData.result.user;
          let walletType = user['walletType'];
          ls.setItem('walletType', walletType);
          ls.setItem("lastLoginTime", new Date().getTime() + "");
          StorageService.ACCOUNT_TYPE = user.accountType;
          StorageService.IS_BENEFICIARY = user.beneficiary;
          ls.setItem("sterlingAccountNumber", user.sterlingAccountNumber);

          try {
            ls.setItem("accountNumber", user.kyc.bankAccountNumber);
            ls.setItem("bankCode", user.kyc.bankCode);
          } catch (e) {
            Console.log(e);
          }

          Constants.IS_LOGGED_IN = true;
          this.navCtrl.push(TabsPage);
        } else {
          this.loading.dismiss();
          Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);

          Console.log(responseData.response_code === 601);
          if (responseData.response_code === 601) {
            //account is not activated
            this.showResendConfirmationEmailDialog();
          } else if (responseData.response_code === 601) {
          }
        }
      },
        error => {
          Console.log(error);
          this.loading.dismiss();
          Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
        });
  }

  showResendConfirmationEmailDialog() {
    const confirm = this.alertCtrl.create({
      title: 'Resend Confirmation Email?',
      message: 'Do you want us to resend the confirmation email to ' + this.ls.getItem('emailAddress') + '?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            //do nothing
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.resendConfirmationEmail();
          }
        }
      ]
    });
    confirm.present();
  }

  resendConfirmationEmail() {
    let emailAddress = this.ls.getItem('emailAddress');
    let requestData = {
      emailAddress: emailAddress,
    };

    let url = Constants.SEND_CONFIRMATION_EMAIL_URL;

    this.http.post(url, requestData, Constants.getHeader())
      .map(res => res.json())
      .subscribe(responseData => {
        Constants.showPersistentToastMessage(responseData.result, this.toastCtrl);
      },
        _error => {
          Constants.showAlert(this.toastCtrl, "Network seems to be down", "You can check your internet connection and/or restart your phone.");
        });
  }


  saveBeneficiary() {
    let postData = Constants.registrationData;
    postData['password'] = this.password;

    let phone = postData['phoneNumber'];

    let app = this;

    app.ls.setItem('postData-' + phone, postData);

    Constants.registrationData = {};

    this.navCtrl.popToRoot();

    Constants.showLongToastMessage("Beneficiary Data saved succeffully. It will be uploaded when you are connected to the internet", this.toastCtrl);
  }

  gotoNextPage() {
    Constants.registrationData['password'] = this.password;

    let rf = Constants.registrationData['rf'];

    let referralCode = rf.referralCode;

    if (referralCode === undefined || referralCode === null || referralCode === '') {
      referralCode = 'XENDBIT';
    }

    Constants.registrationData['email'] = rf.email;
    Constants.registrationData['phoneNumber'] = rf.phoneNumber;
    Constants.registrationData['surName'] = rf.surName;
    Constants.registrationData['firstName'] = rf.firstName;
    Constants.registrationData['middleName'] = rf.middleName;
    Constants.registrationData['bvn'] = rf.bvn;
    Constants.registrationData['idType'] = rf.idType;
    Constants.registrationData['idNumber'] = rf.idNumber;
    Constants.registrationData['bvn'] = rf.bvn;
    Constants.registrationData['dateOfBirth'] = "" + new Date(rf.dateOfBirth).getTime();
    Constants.registrationData['country'] = "";
    Constants.registrationData['enableWhatsapp'] = rf.enableWhatsapp;
    Constants.registrationData['referralCode'] = referralCode;
    if (rf.bank !== undefined && rf.bank !== "") {
      Constants.registrationData['bankCode'] = rf.bank;
    } else {
      Constants.registrationData['bankCode'] = "000";
    }
    Constants.registrationData['accountNumber'] = rf.accountNumber;
    Constants.registrationData['isBeneficiary'] = Constants.IS_LOGGED_IN;
    StorageService.IS_BENEFICIARY = rf.isBeneficiary;

    Constants.registerOnServer();
    //^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$
    // if (this.password !== this.confirmPassword) {
    //   Constants.showLongToastMessage("Passwords did not match", this.toastCtrl);
    // } else {
    //   let found = this.password.search(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
    //   if (found < 0) {
    //     Constants.showLongToastMessage("Please enter a valid password", this.toastCtrl);
    //   } else {
    //     Constants.registrationData['password'] = this.password;
    //     Constants.passwordPadSuccessCallback();
    //   }
    // }
  }
}
