/**
 * Argusoft - Survey
 *
 * @app        Message Service
 * @createdBy  Shaily Mishra
 * @updatedBy
 * @created    1 March 2019
 * @copyright  Copyright (c) 2019 Argusoft | All Rights Reserved
 *
 */

import { TestBed, async, } from '@angular/core/testing';
import { MessageService } from './message.service';
import { MatSnackBarModule } from '@angular/material';
describe('MessageService', () => {

    let service;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MatSnackBarModule
            ],
            declarations: [
            ],
            providers: [
                MessageService
            ]
        });
    }));

    beforeEach(() => {
        service = TestBed.get(MessageService);
    });

    it('should create an instance of Message service', () => {
        console.log('Create Instance of Message Service');
        expect(service).toBeDefined();
    });

});
