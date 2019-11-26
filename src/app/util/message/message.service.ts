

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

/**
 * Message Service Uses Material snackbar to open up toast message => success/error.
 */
@Injectable({
    providedIn: 'root'
})
export class MessageService {
    constructor(private snackBar: MatSnackBar) { }

    /**
     * showMessage : For config we set two properties => color and duration
     * and then call the open method of snackBar with parameters as message, action as close
     * and the config containing color and duration
     */
    showMessage(message: string, type: string) {
        const config = new MatSnackBarConfig();
        config.panelClass = type === 'error' ? ['background-red'] : ['background-green'];
        config.duration = 5000;
        this.snackBar.open(message, 'Close', config);
    }

    showSuccessMessage(message) {
        this.showMessage(message ? message : 'Done Successfully', 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message ? message : 'An Error Has Occured', 'error');

    }

}
