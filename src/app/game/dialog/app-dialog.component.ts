import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-dialog',
    templateUrl: 'app-dialog.component.html',
  })
  export class AppDialog {
  
    constructor(
      public dialogRef: MatDialogRef<AppDialog>,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
  
  }