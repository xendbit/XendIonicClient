import { Observable, Observer } from 'rxjs/Rx';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Platform } from 'ionic-angular';
import { Console } from './console';


export class NFCHelper {

  static writeNFC(msg, platform: Platform, nfc: NFC, ndef: Ndef, toastCtrl): Promise<any> {
    let sub = NFCHelper.readNFC(platform, nfc).subscribe((res) => {
      //Constants.showLongToastMessage("Card Attached. Now Click on Write Card.", toastCtrl);
    });

    let message = ndef.textRecord(msg);
    let retVal = nfc.write([message]);
    sub.unsubscribe();
    return retVal;
  }

  static _readMessage(event, nfc: NFC, observer: Observer<any>) {
    try {
      let bytes = event.tag.ndefMessage[0].payload;
      let tagType = event.tag.type;
      if (tagType === "com.nxp.ndef.mifareclassic" || tagType === "NFC Forum Type 2") {
        // replace first 3 bytes
        bytes = bytes.slice(3);
      }

      let decodedMessage = nfc.bytesToString(bytes);

      observer.next(decodedMessage);
    } catch (err) {

    }
  }

  static readNFC(platform: Platform, nfc: NFC): Observable<any> {



    if (platform.is('core') || platform.is('mobileweb')) {
      return Observable.create((observer: Observer<any>) => { });
    }

    const obs = Observable.create((observer: Observer<any>) => {
      nfc.addTagDiscoveredListener(() => {

      }, (err) => {


        observer.error(err);
      }).subscribe((event) => {




        NFCHelper._readMessage(event, nfc, observer);
      });

      nfc.addNdefListener(() => {

      }, (err) => {


        observer.error(err);
      }).subscribe((event) => {






        NFCHelper._readMessage(event, nfc, observer);
      });

    });

    return obs;
  }

}
