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
      //this.ns.clear();
      //this.ns.set("store", this.data);
      app.ns.get("store").then(
        async (storeData) => {
          app.setReady(true);
          // here iterate through the keys and set them using await/async methods.
          try {
            let keys = Object.keys(storeData);
            for (let key of keys) {
              if (key === "mnemonic" || key === "password") {
                await this.ns.set(key, storeData[key]);
              } else {
                await app.setItem(key, storeData[key]);
              }
            }
            await app.ns.set('__store', storeData);
            await app.ns.remove("store");
          } catch (e) { }
        }
      )
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
      return Constants.decryptData(itemData);
    }

    return itemData;
  }

  async removeItem(key) {
    return await this.ns.remove(key);
  }

  async postDataKeys() {
    let retData = [];
    let keys = await this.ns.keys();
    console.log(keys);
    for (let key of keys) {
      if (key.indexOf('postData') >= 0) {
        retData.push(key);
      }
    }

    console.log(retData);
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
