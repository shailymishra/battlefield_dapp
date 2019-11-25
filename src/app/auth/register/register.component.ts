import { Component, OnInit, NgZone } from "@angular/core";
import * as firebase from "firebase/app";
import { AngularFireAuth } from "@angular/fire/auth";
import { FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Router } from '@angular/router';
import {urls} from '../../shared/constant'

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  registerForm;
  errorMessage;
  successMessage;
  urls;
  constructor(
    public afAuth: AngularFireAuth,
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router,
    public ngZone: NgZone
  ) {}

  ngOnInit() {
    this.urls = urls
    console.log("On init");
    this.registerForm = this.fb.group({
      email: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });
  }

//   doGoogleLogin() {
//     return new Promise<any>((resolve, reject) => {
//       let provider = new firebase.auth.GoogleAuthProvider();
//       provider.addScope("profile");
//       provider.addScope("email");
//       this.afAuth.auth.signInWithPopup(provider).then(res => {
//         resolve(res);
//       });
//     });
//   }

//   tryRegister(value) {
//     this.authService.doRegister(value).then(
//       res => {
//         console.log(res);
//         this.errorMessage = "";
//         this.successMessage = "Your account has been created";
//       },
//       err => {
//         console.log(err);
//         this.errorMessage = err.message;
//         this.successMessage = "";
//       }
//     );
//   }

  goToLogin() {
    this.router.navigate([this.urls.FORGOT_PASSWORD]);
  }
}
