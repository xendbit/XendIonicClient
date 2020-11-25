import { IonicErrorHandler } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class MyExceptionHandler extends IonicErrorHandler {

    constructor(public alertCtrl: AlertController, public http: Http) {
        super();
    }

    handleError(error: any) {
        console.log(error);
        if ((error.message.indexOf('FingerprintAIO') >= 0) || (error.message.indexOf("Cannot read property") >= 0)) {
            error.message = "phem";
            return;
        } else {
            let options = {
                title: "Error Occured.",
                message: error.message,
            };

            console.log(options);

            // let alert = this.alertCtrl.create(options);
            // alert.present();
            //we should send this error to a slack channel
        }
        super.handleError(error);
    }

    // humanReadable(errorMessage: string) {
    //     if (errorMessage.indexOf('No Provider for FingerprintAIO') > 0) {
    //         return "phem";
    //     } 
    //     return errorMessage;
    // }
}