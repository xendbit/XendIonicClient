import { Console } from './../utils/console';
import { StorageService } from './../utils/storageservice';
import { Constants } from './../utils/constants';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

/**
 * Generated class for the ProductsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})
export class ProductsPage {

  manufacturerId;
  manufacturers = [];
  products = [];
  selectedProducts = [];
  ls: StorageService;
  productNames = [];
  productPrices = [];
  productQuantities = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController) {
    this.ls = Constants.storageService;
  }

  ionViewDidEnter() {
  }

  async ionViewDidLoad() {
    this.manufacturerId = await this.ls.getItem("manufacturerId");
    this.products = Constants.properties['products'];
    this.manufacturerSelected();
  }

  checkout() {
    let pn = [];
    let pp = [];
    let pq = [];
    for (let rows of this.selectedProducts) {
      for (let selectedProduct of rows) {
        if (selectedProduct.quantity > 0) {
          pn.push(selectedProduct.name);
          pp.push(selectedProduct.price);
          pq.push(selectedProduct.quantity);
        }
      }
    }

    this.productNames = pn;
    this.productPrices = pp;
    this.productQuantities = pq;

    if (pn.length <= 0) {
      Constants.showLongToastMessage("Please enter the quantity of at least one product", this.toastCtrl);
      return;
    }

    this.continue();
  }

  continue() {
    Constants.otherData = {};
    Constants.otherData['productNames'] = this.productNames;
    Constants.otherData['productPrices'] = this.productPrices;
    Constants.otherData['productQuantities'] = this.productQuantities;

    this.navCtrl.push('SalePage');
  }

  manufacturerSelected() {
    let manId = this.manufacturerId;
    this.selectedProducts = [];
    if (manId !== null && manId !== undefined) {
      let row = [];
      let index = 0;
      for (let product of this.products) {
        if (product.manufacturer_id == manId) {
          row.push(product);
          index++;
          if (index === 3) {
            this.selectedProducts.push(row);
            row = [];
            index = 0;
          }
        }
      }

      if(row.length > 0) {
        this.selectedProducts.push(row);
      }
    }
  }
}
