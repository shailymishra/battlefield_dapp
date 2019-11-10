import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UtilModule } from "../util/util.module";
import { RouterModule } from "@angular/router";
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatSnackBarModule,
  MatGridListModule,
  MatDialogModule
} from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { GameComponent } from "./game.component";
import { AppDialog } from './dialog/app-dialog.component';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSnackBarModule,
    MatGridListModule,
    MatDialogModule,
    RouterModule,
    UtilModule
  ],
  declarations: [GameComponent,AppDialog],
  entryComponents: [AppDialog],
  exports: [GameComponent,]
})
export class GameModule {}
