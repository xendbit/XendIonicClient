import { NFC, Ndef } from '@ionic-native/nfc';
import { Platform, ToastController } from 'ionic-angular';
import { Observer } from 'rxjs';
import { Console } from './console';


export class NFCHelper {

  static writeNFC(msg, platform: Platform, nfc: NFC, ndef: Ndef): Promise<any> {
    NFCHelper.readNFC(platform, nfc);
    Console.log('Writing info to card: ' + msg);
    let message = ndef.textRecord(msg);
    return nfc.write([message]);
  }

  static _readMessage(event, nfc: NFC, resolve) {
    try {
      let bytes = event.tag.ndefMessage[0].payload;
      if (event.tag.type === "com.nxp.ndef.mifareclassic") {
        // replace first 3 bytes
        bytes = bytes.slice(3);
      }

      let decodedMessage = nfc.bytesToString(bytes);

      resolve(decodedMessage);
    } catch (err) {
      Console.log(err);
    }
  }

  static readNFC(platform: Platform, nfc: NFC): Promise<any> {
    Console.log("is_core: " + platform.is('core'));
    Console.log("is_mobileweb: " + platform.is('mobileweb'));

    if (platform.is('core') || platform.is('mobileweb')) {
      return;
    }

    const obs = new Observer.create((resolve, reject) => {
      nfc.addTagDiscoveredListener(() => {
        Console.log('successfully attached TagDiscoveredListener listener');
      }, (err) => {
        Console.log('error attaching TagDiscoveredListener listener: ');
        Console.log(err);

        reject(err);
      }).subscribe((event) => {
        Console.log('received TagDiscoveredListener message. the tag contains: ');
        Console.log(event.tag);
        Console.log('decoded tag id: ');
        Console.log(nfc.bytesToHexString(event.tag.id));

        NFCHelper._readMessage(event, nfc, resolve);
      });

      nfc.addNdefListener(() => {
        Console.log('successfully attached NdefListener listener');
      }, (err) => {
        Console.log('error attaching NdefListener listener: ');
        Console.log(err);
        reject(err);
      }).subscribe((event) => {
        Console.log(event);
        Console.log('received NdefListener message. the tag contains: ');
        Console.log(event.tag);
        Console.log('decoded tag id: ');
        Console.log(nfc.bytesToHexString(event.tag.id));

        NFCHelper._readMessage(event, nfc, resolve);
      });

    });

    return promise;
  }

}
