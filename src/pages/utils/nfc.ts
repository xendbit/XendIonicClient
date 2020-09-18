import { Observable } from 'rxjs/Rx';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Platform, ToastController } from 'ionic-angular';
import { Constants } from './constants';
import { Console } from './console';


export class NFCHelper {

  static writeNFC(msg, platform: Platform, nfc: NFC, ndef: Ndef, toastCtrl: ToastController, writeCallBack) {
    NFCHelper.initializeNFC(platform, nfc, ndef, toastCtrl, () => {});
    Console.log('Writing info to card: ' + msg);
    let message = ndef.textRecord(msg);
    nfc.write([message]).then((_success) => {
      Console.log("Write Successfully")
      Constants.showLongToastMessage("Card Written Successfully", toastCtrl);
      writeCallBack();
    }).catch((_error) => {
      Console.log(_error);
    });
  }

  static initializeNFC(platform: Platform, nfc: NFC, ndef: Ndef, toastCtrl: ToastController, rcb) {
    Console.log("is_core: " + platform.is('core'));
    Console.log("is_mobileweb: " + platform.is('mobileweb'));

    if (platform.is('core') || platform.is('mobileweb')) {
      return;
    }

    var observer = Observable.create(
      function subscribe(subscriber) {
        nfc.addTagDiscoveredListener(() => {
          Console.log('successfully attached ndef listener');
        }, (err) => {
          Console.log('error attaching ndef listener: ');
          Console.log(err);
        }).subscribe((event) => {
          Console.log(event);
          Console.log('received ndef message. the tag contains: ');
          Console.log(event.tag);
          Console.log('decoded tag id: ');
          Console.log(nfc.bytesToHexString(event.tag.id));

          try {
            let bytes = event.tag.ndefMessage[0].payload;
            if (event.tag.type === "com.nxp.ndef.mifareclassic") {
              // replace first 3 bytes
              bytes = bytes.slice(3);
            }

            let decodedMessage = nfc.bytesToString(bytes);

            Console.log("Decoded Message: " + decodedMessage);
            subscriber.next(decodedMessage);
          } catch (err) {
            Console.log(err);
          }
        });
      }
    );

    return observer;
  }

}
