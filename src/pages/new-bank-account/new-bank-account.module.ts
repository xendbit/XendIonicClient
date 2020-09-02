import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewBankAccountPage } from './new-bank-account';

@NgModule({
  declarations: [
    NewBankAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(NewBankAccountPage),
  ],
})
export class NewBankAccountPageModule {}
