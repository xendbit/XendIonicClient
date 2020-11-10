import { Console } from './../pages/utils/console';
import { Constants } from './../pages/utils/constants';
import { StorageService } from './../pages/utils/storageservice';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { StartPage } from '../pages/start/start';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  templateUrl: 'app.html'
})

export class MyApp {

  rootPage: any;
  ss: StorageService;

  constructor(public splashScreen: SplashScreen, public stBar: StatusBar, public platform: Platform, private ns: Storage) {
    var app = this;

    platform.registerBackButtonAction(() => {
      //sometimes the best thing you can do is not think, not wonder, not imagine, not obsess.
      //just breathe, and have faith that everything will work out for the best.
      console.log("Back Button Pressed");
    }, 1);

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //this.loadSettings(app);
      stBar.styleDefault();
      // this.takeOverConsole();
      setTimeout(async () => {
        this.ss = new StorageService(ns);
        Constants.storageService = this.ss;
        Console.log("Initialized Storage Service");
        this.ns.get("store").then(
          async (storeData) => {
            // here iterate through the keys and set them using await/async methods.
            try {
              let keys = Object.keys(storeData);
              Console.log("Store Data Keys");
              Console.log(keys);
              for (let key of keys) {
                Console.log(key + ", " + storeData[key]);
                if (key === "mnemonic" || key === "password") {
                  await this.ns.set(key, storeData[key]);
                } else {
                  await this.ss.setItem(key, storeData[key]);
                }
              }
              await this.ns.set('__store', storeData);
              await app.ns.remove("store");
            } catch (e) { }
          }
        );
        this.splashScreen.hide();
        app.rootPage = StartPage;
      }, 5000);
    });
  }

  takeOverConsole() {
    const ws = new WebSocket('ws://lb.xendbit.com:18333')

    ws.onopen = () => {
      // Web Socket is connected, send data using send()
      ws.send('Connected!');

      const comn = window.console;

      if (!comn) {
        return
      }

      const methods = ['log', 'warn', 'error'];

      for (let i = 0; i < methods.length; i++) {
        const original = window.console[methods[i]]

        window.console[methods[i]] = function () {
          const output = []

          try {
            // @ts-ignore
            for (const argument of arguments) {
              output.push(typeof argument === 'string' ? argument : JSON.stringify(argument));
            }

            ws.send(methods[i].toUpperCase() + ': ' + output.join(', '));
          } catch (error) {
            window.console.error('Websocket Console Error', error);
          }

          original.apply(window.console, arguments);
        }
      }
    }

    ws.onclose = function () {
      // websocket is closed.
      alert('Websocket Console closed.')
    }
  }
}
