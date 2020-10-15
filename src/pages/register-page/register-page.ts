import { StorageService } from './../utils/storageservice';
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
  clusters = [];
  tradeSubtypes = [];
  selectedTradeSubtypes = [];
  disabilityTypes = [];
  disabilitySubtypes = [];
  selectedDisabilitySubTypes = [];
  banks = [];
  bank = 'Sterling Bank';
  idTypes = [];

  idImagePath: string = undefined;
  idImage: string;


  photoImagePath: string = undefined;
  photoImage: string;


  lat: number;
  long: number;

  loading: Loading;
  ls: StorageService;

  constructor(public camera: Camera, public androidPermissions: AndroidPermissions, public base64: Base64, public imageResizer: ImageResizer, private toastCtrl: ToastController, private geolocation: Geolocation, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, private http: Http, private loadingCtrl: LoadingController, public platform: Platform) {

    this.platform.ready().then(() => {
      androidPermissions.requestPermissions([androidPermissions.PERMISSION.CAMERA, androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
    });

    this.platform.registerBackButtonAction(() => {
      //sometimes the best thing you can do is not think, not wonder, not imagine, not obsess.
      //just breathe, and have faith that everything will work out for the best.
      Console.log("Back Button Pressed");
    }, 1);

    this.states = Constants.properties['states'];
    this.lgas = Constants.properties['lgas'];

    this.tradeSubtypes = Constants.properties['trade.subtypes'];
    this.tradeTypes = Constants.properties['trade.types']

    this.banks = Constants.properties['banks'];
    this.idTypes = Constants.properties['id.types'];

    this.disabilityTypes = Constants.properties['disability.types'];
    this.disabilitySubtypes = Constants.properties['disability.subtypes'];

    this.clusters = Constants.properties['clusters'];

    this.registerPageOneForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
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


  clearForm() {
    this.registerPageOneForm.reset();
    this.registerPageTwoForm.reset();
    this.registerPageThreeForm.reset();
    this.registerPageFourForm.reset();
    this.registerPageFiveForm.reset();
  }

  capturePassport(sourceType) {
    Console.log("Capturing Passport");
    if (this.platform.is('core') || this.platform.is('mobileweb')) {
      this.photoImagePath = "path";
      this.photoImage = PreImage.photoImage;
      return;
    }

    const options: CameraOptions = {
      quality: 15,
      sourceType: sourceType,
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

  captureIdImage(sourceType) {
    Console.log("Capturing Id Image");
    if (this.platform.is('core') || this.platform.is('mobileweb')) {
      this.idImagePath = "path";
      this.idImage = PreImage.idImage;
      return;
    }

    const options: CameraOptions = {
      quality: 15,
      sourceType: sourceType,
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

  async submit() {
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
    Constants.registrationData['cluster'] = rf.cluster;
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
    Constants.registrationData['agentEmail'] = await this.ls.getItem("emailAddress");

    Constants.otherData['is_beneficiary'] = true;
    Constants.otherData['is_login'] = false;
    Constants.otherData['is_agent_register'] = false;

    if (Constants.otherData['editMode'] === true) {
      let key = 'postData-' + Constants.registrationData['phoneNumber'];
      let errorKey = 'serverError-' + Constants.registrationData['phoneNumber'];
      await this.ls.setItem(key, Constants.registrationData);
      await this.ls.removeItem(errorKey);
      Constants.registrationData = {};
      Constants.otherData['editMode'] = false;
      Constants.otherData['editModeKey'] = "";
      this.navCtrl.popToRoot();
      Constants.showLongToastMessage("Beneficiary Data saved succeffully. It will be uploaded when you are connected to the internet", this.toastCtrl);
    } else {
      this.navCtrl.push('PasswordPage');
    }
  }

  ionViewWillEnter() {
    Constants.otherData['loading'] = this.loading;
    Constants.otherData['loadingCtrl'] = this.loadingCtrl;
    Constants.otherData['http'] = this.http;
    Constants.otherData['ls'] = this.ls;
    Constants.otherData['toastCtrl'] = this.toastCtrl;
    Constants.otherData['obv'] = Observable;
    Constants.otherData['navCtrl'] = this.navCtrl;

    this.bank = "Sterling Bank";

    this.page = 1;
  }

  ionViewDidEnter() {
    Console.log("ionViewDidEnter entered");
  }

  async ionViewDidLoad() {
    Console.log('ionViewDidLoad RegisterPageOnePage');
    this.clearForm();
    let editMode = Constants.otherData['editMode'];
    //this.registerPageOneForm.controls.state.setValue('Delta');
    if (editMode) {
      let key = Constants.otherData['editModeKey'];
      key = "postData-" + key.split('-')[1];
      let postData = await this.ls.getItem(key);
      let f1c = this.getFormControls(this.registerPageOneForm);
      f1c.firstName.setValue(postData['firstName']);
      f1c.lastName.setValue(postData['lastName']);
      f1c.middleName.setValue(postData['middleName']);
      f1c.phoneNumber.setValue(postData['phoneNumber']);
      f1c.gender.setValue(postData['gender']);
      f1c.dateOfBirth.setValue(new Date(postData['dateOfBirth']));
      f1c.address.setValue(postData['address']);
      try {
        f1c.disabilityType.setValue(postData['disabilityType']);
        this.disabilityTypeSelected(postData['disabilityType']);
      } catch (e) {}
      try {
        f1c.disabilitySubtype.setValue(postData['disabilitySubtype']);
      } catch (e) {}
      f1c.state.setValue(postData['state']);
      this.stateSelected(postData['state']);
      f1c.lga.setValue(postData['lga']);

      let f2c = this.getFormControls(this.registerPageTwoForm);
      f2c.cluster.setValue(postData['cluster']);
      f2c.association.setValue(postData['association']);
      f2c.tradeType.setValue(postData['tradeType']);
      this.tradeTypeSelected(postData['tradeType']);
      f2c.tradeSubtype.setValue(postData['tradeSubtype']);

      let f3c = this.getFormControls(this.registerPageThreeForm);
      f3c.accountNumber.setValue(postData['accountNumber']);
      f3c.bvn.setValue(postData['bvn']);

      let f4c = this.getFormControls(this.registerPageFourForm);
      f4c.nokFirstName.setValue(postData['nokFirstName']);
      f4c.nokLastName.setValue(postData['nokLastName']);
      f4c.nokPhoneNumber.setValue(postData['nokPhoneNumber']);
      f4c.guarantorFirstName.setValue(postData['guarantorFirstName']);
      f4c.guarantorLastName.setValue(postData['guarantorLastName']);
      f4c.guarantorPhoneNumber.setValue(postData['guarantorPhoneNumber']);

      let f5c = this.getFormControls(this.registerPageFiveForm);
      f5c.idType.setValue(postData['idType']);
      f5c.idNumber.setValue(postData['idNumber']);
      f5c.idExpiry.setValue(new Date(postData['idExpiry']));
      this.idImage = postData['idImage'];
      this.photoImage = postData['photoImage'];
    }
  }

  getFormControls(form) {
    return form.controls;
  }

  tradeTypeSelected(value) {
    console.log("Trade type selected: " + value);
    let tradeType = this.findTradeTypeById(value);
    this.selectedTradeSubtypes = this.findTradeSubtypeByTypeId(tradeType.typeId);
  }

  findTradeTypeById(tradeTypeId) {
    for (let tradeType of this.tradeTypes) {
      if (tradeType.typeId === tradeTypeId) {
        console.log("Found Trade Type --> ", tradeType);
        return tradeType;
      }
    }
  }

  getTradeSubType(tradeSubtypeId) {
    for (let tradeSubtype of this.tradeSubtypes) {
      if (tradeSubtype.subTypeId === tradeSubtypeId) {
        console.log("Found Trade Sub Type --> ", tradeSubtype);
        return tradeSubtype;
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
    console.log(this.selectedDisabilitySubTypes);
  }

  getDisabilitySubType(type) {
    for (let disabilitySubtype of this.disabilitySubtypes) {
      if (disabilitySubtype.subTypeId === type) {
        return disabilitySubtype;
      }
    }
  }

  getDisabilityType(type) {
    for (let disabilityType of this.disabilityTypes) {
      if (disabilityType.typeId === type) {
        return disabilityType;
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

  findLgaByName(name) {
    for (let lga of this.lgas) {
      if (lga.name === name) {
        return lga;
      }
    }
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
      this.navCtrl.popToRoot();
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
