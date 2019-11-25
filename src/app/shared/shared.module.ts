import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from './angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
@NgModule({
    imports: [
        CommonModule,
        AngularMaterialModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    declarations: [
    ],
    exports: [
        CommonModule,
        AngularMaterialModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        FormsModule,
        ],
    providers: [
    ]
})
export class SharedModule {

}

