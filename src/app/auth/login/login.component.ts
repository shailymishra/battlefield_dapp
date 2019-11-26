import { Component, OnInit, NgZone } from "@angular/core";
import * as firebase from "firebase/app";
import { AngularFireAuth } from "@angular/fire/auth";
import { FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { urls } from "../../shared/constant";
import { AuthMockService } from "../auth.mock.service";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  urls;
  loginForm;
  errorMessage;
  successMessage;
  constructor(
    public afAuth: AngularFireAuth,
    private fb: FormBuilder,
    private authService: AuthMockService,
    public router: Router,
    public ngZone: NgZone
  ) {}

  ngOnInit() {
    this.urls = urls;
    console.log("On init");
    this.loginForm = this.fb.group({
      email: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });
    this.authService.isLoggedInSubject.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate([this.urls.DASHBOARD]);
      }
    });
  }

  goToRegister() {
    this.router.navigate([this.urls.REGISTER]);
  }

  goToForgotPassword() {
    this.router.navigate([this.urls.FORGOT_PASSWORD]);
  }

  login(form: any) {
    this.authService.login(form.value).subscribe(() => {
      this.router.navigate([this.urls.DASHBOARD]);
    });
  }
}
