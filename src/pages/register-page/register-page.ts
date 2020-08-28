import { PreImage } from './../utils/preimage';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Base64 } from '@ionic-native/base64';
import { ImageResizer } from '@ionic-native/image-resizer';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Loading, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Console } from '../utils/console';
import { Constants } from '../utils/constants';
import { Geolocation } from '@ionic-native/geolocation';
import 'rxjs/add/operator/map';

declare var genwallet: any;

/**
 * Generated class for the RegisterPageOnePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register-page',
  templateUrl: 'register-page.html',
})
export class RegisterPaginated {

  registerPageOneForm;
  registerPageTwoForm;
  registerPageThreeForm;
  registerPageFourForm;
  registerPageFiveForm;

  page = 1;

  states = [];
  lgas = [];
  selectedLGAs = [];
  tradeTypes = [];
  tradeSubtypes = [];
  selectedTradeSubtypes = [];
  disabilityTypes = [];
  disabilitySubtypes = [];
  selectedDisabilitySubTypes = [];
  banks = [];
  bank = 'Sterling Bank';
  idTypes = []

  idImagePath: string = undefined;
  idImage: string;


  photoImagePath: string = undefined;
  photoImage: string;


  lat: number;
  long: number;

  loading: Loading;
  ls;

  constructor(public camera: Camera, public androidPermissions: AndroidPermissions, public base64: Base64, public imageResizer: ImageResizer, private toastCtrl: ToastController, private geolocation: Geolocation, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, private http: Http, private loadingCtrl: LoadingController, public platform: Platform) {

    this.platform.ready().then(() => {
      androidPermissions.requestPermissions([androidPermissions.PERMISSION.CAMERA, androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
    });

    this.states = Constants.properties['states'];
    this.lgas = Constants.properties['lgas'];

    this.tradeSubtypes = Constants.properties['trade.subtypes'];
    this.tradeTypes = Constants.properties['trade.types']

    this.banks = Constants.properties['banks'];
    this.idTypes = Constants.properties['id.types'];

    this.disabilityTypes = Constants.properties['disability.types'];
    this.disabilitySubtypes = Constants.properties['disability.subtypes'];

    this.registerPageOneForm = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      middleName: [''],
      phoneNumber: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required],
      disabilityType: [''],
      disabilitySubtype: [''],
      state: ['', Validators.required],
      lga: ['', Validators.required],
    });

    this.registerPageTwoForm = this.formBuilder.group({
      cluster: ['', Validators.required],
      association: ['', Validators.required],
      gpsCoordinate: [''],
      tradeType: ['', Validators.required],
      tradeSubtype: ['', Validators.required],
    });

    this.registerPageThreeForm = this.formBuilder.group({
      accountNumber: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.required])],
      bvn: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
    });

    this.registerPageFourForm = this.formBuilder.group({
      nokFirstName: ['', Validators.required],
      nokLastName: ['', Validators.required],
      nokPhoneNumber: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
      guarantorFirstName: ['', Validators.required],
      guarantorLastName: ['', Validators.required],
      guarantorPhoneNumber: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
    });

    this.registerPageFiveForm = this.formBuilder.group({
      idType: ['', Validators.required],
      idNumber: ['', Validators.required],
      idExpiry: ['', Validators.required],
      smi: ['', Validators.required]
    });


    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  capturePassport() {
    Console.log("Capturing Passport");
    if (this.platform.is('core') || this.platform.is('mobileweb')) {
      this.photoImagePath = "path";
      this.photoImage = PreImage.photoImage;
      return;
    }

    const options: CameraOptions = {
      quality: 15,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.photoImage = base64Image;
      this.photoImagePath = "data:image";
      Console.log(base64Image);
    }, (err) => {
      // Handle error
    });
  }

  captureIdImage() {
    Console.log("Capturing Id Image");
    if (this.platform.is('core') || this.platform.is('mobileweb')) {
      this.idImagePath = "path";
      this.idImage = PreImage.idImage;
      return;
    }

    const options: CameraOptions = {
      quality: 15,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.idImage = base64Image;
      this.idImagePath = "data:image";
      Console.log(base64Image);
    }, (err) => {
      // Handle error
    });
  }

  submit() {
    let rf = this.registerPageOneForm.value;
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude
      Console.log(resp);
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    Constants.registrationData = {};

    Constants.registrationData['firstName'] = rf.firstName;
    Constants.registrationData['lastName'] = rf.lastName;
    Constants.registrationData['middleName'] = rf.middleName;
    Constants.registrationData['phoneNumber'] = rf.phoneNumber;
    Constants.registrationData['gender'] = rf.gender;
    Constants.registrationData['dateOfBirth'] = new Date(rf.dateOfBirth).getTime();
    Constants.registrationData['address'] = rf.address;
    Constants.registrationData['disabilityType'] = rf.disabilityType;
    Constants.registrationData['disabilitySubtype'] = rf.disabilitySubtype;
    Constants.registrationData['state'] = rf.state;
    Constants.registrationData['lga'] = rf.lga;

    rf = this.registerPageTwoForm.value;
    Constants.registrationData['cluster'] = rf.gender;
    Constants.registrationData['association'] = rf.association;
    Constants.registrationData['gpsCoordinates'] = this.lat + "," + this.long;
    Constants.registrationData['tradeType'] = rf.tradeType;
    Constants.registrationData['tradeSubtype'] = rf.tradeSubtype;

    rf = this.registerPageThreeForm.value;
    Constants.registrationData['accountName'] = "";
    Constants.registrationData['accountNumber'] = rf.accountNumber;
    Constants.registrationData['bank'] = this.bank;
    Constants.registrationData['bvn'] = rf.bvn;

    rf = this.registerPageFourForm.value;
    Constants.registrationData['nokFirstName'] = rf.nokFirstName;
    Constants.registrationData['nokLastName'] = rf.nokLastName;
    Constants.registrationData['nokPhoneNumber'] = rf.nokPhoneNumber;
    Constants.registrationData['guarantorFirstName'] = rf.guarantorFirstName;
    Constants.registrationData['guarantorLastName'] = rf.guarantorLastName;
    Constants.registrationData['guarantorPhoneNumber'] = rf.guarantorPhoneNumber;

    rf = this.registerPageFiveForm.value;
    Constants.registrationData['idType'] = rf.idType;
    Constants.registrationData['idNumber'] = rf.idNumber;
    Constants.registrationData['idExpiry'] = new Date(rf.idExpiry).getTime();
    Constants.registrationData['idImage'] = this.idImage;
    Constants.registrationData['photoImage'] = this.photoImage;

    let result = genwallet();
    Constants.registrationData['passphrase'] = result.mnemonic;
    Constants.registrationData['dateRegistered'] = new Date().getTime();
    Constants.registrationData['agentEmail'] = this.ls.getItem("emailAddress");

    Constants.otherData['is_beneficiary'] = true;
    this.navCtrl.push('PasswordPage');
  }

  ionViewWillEnter() {
    Constants.otherData['loading'] = this.loading;
    Constants.otherData['loadingCtrl'] = this.loadingCtrl;
    Constants.otherData['http'] = this.http;
    Constants.otherData['ls'] = this.ls;
    Constants.otherData['toastCtrl'] = this.toastCtrl;
    Constants.otherData['obv'] = Observable;
    Constants.otherData['navCtrl'] = this.navCtrl;

    this.page = 1;
    this.registerPageOneForm.reset();
    this.registerPageTwoForm.reset();
    this.registerPageThreeForm.reset();
    this.registerPageFourForm.reset();
    this.registerPageFiveForm.reset();
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad RegisterPageOnePage');
  }

  tradeTypeSelected(value) {
    console.log("Trade type selected: " + value);
    let tradeType = this.findTradeTypeById(value);
    this.selectedTradeSubtypes = this.findTradeSubtypeByTypeId(tradeType.typeId);
  }


  findTradeTypeById(tradeTypeId) {
    for (let tradeType of this.tradeTypes) {
      if (tradeType.typeId === tradeTypeId) {
        return tradeType;
      }
    }
  }

  findTradeSubtypeByTypeId(tradeTypeId) {
    let found = [];
    for (let tradeSubtype of this.tradeSubtypes) {
      if (tradeSubtype.typeId === tradeTypeId) {
        found.push(tradeSubtype);
      }
    }

    return found;
  }

  disabilityTypeSelected(typeId) {
    Console.log("Type ID: " + typeId);
    for (let disabilityType of this.disabilityTypes) {
      if (disabilityType.typeId === typeId) {
        this.selectedDisabilitySubTypes = this.findDisabilitySubTypes(disabilityType.typeId);
      }
    }
  }

  findDisabilitySubTypes(typeId) {
    let found = [];
    for (let disabilitySubtype of this.disabilitySubtypes) {
      Console.log(disabilitySubtype);
      if (disabilitySubtype.typeId === typeId) {
        Console.log(found);
        found.push(disabilitySubtype);
      }
    }

    return found;
  }

  stateSelected(value) {
    let state = this.findStateByName(value);
    this.selectedLGAs = this.findLGAByStateId(state.id);
  }

  findLGAByStateId(id) {
    let found = [];
    for (let lga of this.lgas) {
      if (lga.state_id === id) {
        found.push(lga);
      }
    }

    return found;
  }

  findStateByName(name) {
    for (let state of this.states) {
      if (state.name === name) {
        return state;
      }
    }
  }

  validateForm() {
    switch (this.page) {
      case 1:
        if (!this.registerPageOneForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }

        let rf = this.registerPageOneForm.value;
        let dob = rf.dateOfBirth;
        let age = new Date(dob);
        var myAge = ~~((Date.now() - age.getTime()) / (31557600000));

        if (myAge < 18) {
          Constants.showLongToastMessage("Beneficiary must be at least 18 years old", this.toastCtrl);
          return false;
        }

        break;
      case 2:
        if (!this.registerPageTwoForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }
        break;
      case 3:
        if (!this.registerPageThreeForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }

        break;
      case 4:
        if (!this.registerPageFourForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }

        rf = this.registerPageFourForm.value;
        if (rf.nokFirstName === rf.nokLastName || rf.nokFirstName === rf.nokPhoneNumber || rf.nokLastName === rf.nokPhoneNumber) {
          Constants.showLongToastMessage("All next of kin must be unique", this.toastCtrl);
          return false;
        }

        if (rf.guarantorFirstName === rf.guarantorLastName || rf.guarantorFirstName === rf.guarantorPhoneNumber || rf.guarantorLastName === rf.guarantorPhoneNumber) {
          Constants.showLongToastMessage("All guarantors must be unique", this.toastCtrl);
          return false;
        }

        break;
      case 5:
        if (!this.registerPageFiveForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }

        if (this.idImagePath === undefined) {
          Constants.showLongToastMessage("Please capture a picture of yourself", this.toastCtrl);
          return false;
        }
        break;
    }

    return true;
  }

  previous() {
    this.page -= 1;
    if (this.page < 1) {
      this.page = 1;
    }
  }

  next() {
    if (this.validateForm()) {
      this.page += 1;
      if (this.page > 5) {
        this.page = 5;
      }
    }
  }
}
