import { Injectable, NgZone } from "@angular/core";
import * as firebase from "firebase/app";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { urls } from "../shared/constant";
// import {admin} from "@angular/fire/auth"
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { BehaviorSubject } from "rxjs";
import { AngularFireDatabase } from "@angular/fire/database";
@Injectable()
export class AuthService {
  userData: any; // Save logged in user data
  urls;
  _isLoggedIn = new BehaviorSubject(false);
  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning,
    public fireDB: AngularFireDatabase
  ) {
    this.urls = urls;
    this.afAuth.authState.subscribe(user => {
      if (user) {
        console.log("Already a user exists!!", user);
        this.userData = user;
        localStorage.setItem("user", JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem("user"));
        this._isLoggedIn.next(true);
        this.getUsers();
      } else {
        console.log("No User Found");
        localStorage.setItem("user", null);
        JSON.parse(localStorage.getItem("user"));
        this._isLoggedIn.next(false);
      }
    });
  }

  // login in with email/password
  login(form) {
    const formValue = form.value;
    return this.afAuth.auth
      .signInWithEmailAndPassword(formValue.email, formValue.password)
      .then(result => {
        this.SetUserData(result.user);
        this._isLoggedIn.next(true);
        this.ngZone.run(() => {
          this.router.navigate(["dashboard"]);
        });
      })
      .catch(error => {
        console.log("Issue");
        window.alert(error.message);
      });
  }

  // Sign up with email/password
  register(form) {
    const formValue = form.value;
    return this.afAuth.auth
      .createUserWithEmailAndPassword(formValue.email, formValue.password)
      .then(result => {
        /* Call the SendVerificaitonMail() function when new user sign 
          up and returns promise */
        // this.SendVerificationMail();
        this.SetUserData(result.user);
        this._isLoggedIn.next(true);
        this.ngZone.run(() => {
          this.router.navigate(["dashboard"]);
        });
      })
      .catch(error => {
        window.alert(error.message);
      });
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem("user"));
    return user !== null ? true : false;
  }

  // Sign in with Google
  googleAuth() {
    return this.AuthLogin(new firebase.auth.GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
    return this.afAuth.auth
      .signInWithPopup(provider)
      .then(result => {
        this.SetUserData(result.user);
        this._isLoggedIn.next(true);
        this.ngZone.run(() => {
          this.router.navigate(["dashboard"]);
        });
      })
      .catch(error => {
        window.alert(error);
      });
  }

  /* Setting up user data when sign in with username/password, 
    sign up with username/password and sign in with social auth  
    provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData = {
      uid: user.uid,
      email: user.email
      // displayName: user.displayName,
      // photoURL: user.photoURL,
      // emailVerified: user.emailVerified
    };
    return userRef.set(userData, {
      merge: true
    });
  }

  // Sign out
  logout() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem("user");
      this._isLoggedIn.next(false);
      this.router.navigate(["login"]);
    });
  }

  getUsers() {
    console.log("get users");
    this.fireDB
      .list("user")
      .snapshotChanges()
      .subscribe(res => {
        console.log("Ress", res);
        res.forEach(doc => {
          console.log("doc", doc);
        });
      });
  }
}
