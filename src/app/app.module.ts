import { TabsPage } from './../pages/tabs/tabs';
import { MyExceptionHandler } from './../pages/utils/exceptionhandler';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { StartPage } from '../pages/start/start';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { LoginPage } from '../pages/login/login';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';


@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    StartPage,
    LoginPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: ['sqlite', 'localstorage', 'indexeddb', 'websql']
    }
    )
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    StartPage,
    LoginPage
  ],
  providers: [
    { provide: ErrorHandler, useClass: MyExceptionHandler },
    SplashScreen,
    StatusBar,
    FingerprintAIO
  ]
})
export class AppModule { }
