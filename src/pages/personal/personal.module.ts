import { ImageResizer } from '@ionic-native/image-resizer';
import { MediaCapture } from '@ionic-native/media-capture';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Base64 } from '@ionic-native/base64';
import { PersonalPage } from './personal';
import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [
      PersonalPage,
    ],
    imports: [
      IonicPageModule.forChild(PersonalPage),
    ],
    exports: [
      PersonalPage
    ],
    providers: [
        FileTransfer,
        Base64,
        MediaCapture,
        ImageResizer        
    ]
  })

  export class PersonalPageModule {}