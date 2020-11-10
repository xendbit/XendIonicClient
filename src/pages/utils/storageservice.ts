import { Console } from './console';
import { Constants } from './constants';
import { Storage } from '@ionic/storage';

export class StorageService {
  static ACCOUNT_TYPE;
  static IS_BENEFICIARY;
  private ns: Storage;
  private ready = false;

  constructor(storage: Storage) {
    let app = this;
    app.ns = storage;
    app.ns.ready().then(() => {
    });
  }

  setReady(ready) {
    this.ready = ready;
  }

  isReady() {
    return this.ready;
  }

  async setItem(key, itemData) {
    if (key === "mnemonic" || key === "password") {
      itemData = Constants.encryptData(itemData);
    }
    return await this.ns.set(key, itemData);
  }

  async getItem(key) {
    let itemData = await this.ns.get(key);
    if (key === "mnemonic" || key === "password") {
      itemData = Constants.decryptData(itemData);
    }

    return itemData;
  }

  async removeItem(key) {
    return await this.ns.remove(key);
  }

  async postDataKeys() {
    let retData = [];
    let keys = await this.ns.keys();
    for (let key of keys) {
      if (key.indexOf('postData') >= 0) {
        retData.push(key);
      }
    }

    return await retData;
  }

  async errorKeys() {
    let retData = [];
    let keys = await this.ns.keys();
    for (let key of keys) {
      if (key.indexOf('serverError') >= 0) {
        retData.push(key);
      }
    }

    return await retData;
  }

  clear() {
    this.ns.clear().then(() => { });
  }
}
