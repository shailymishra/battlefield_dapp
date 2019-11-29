import { Injectable } from "@angular/core";
import { BehaviorSubject, of, Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { data } from "./auth.mock.data";
import { MessageService } from "../util/message/message.service";
import { Router } from "@angular/router";
import { urls } from "../shared/constant";
import { HttpClient } from '@angular/common/http';
import { Web3Service } from '../util/web3.service';
export interface ApiResponse {
  message: string;
  details?: any;
}

@Injectable()
export class AuthMockService {
  urls;
  codes = {
    EMAIL_NOT_PRESENT: "security_user_not_found",
    PASSWORD_WRONG: "security_user_password_invalid",
    LOGIN_SUCCESFULL: "security_user_authentication_successful",
    USER_ALREADY_REGISTERED: "security_user_already_registrated",
    USER_REGISTERED_SUCCESSFUL: "security_user_registrated_successful",
    CHANGED_PASSWORD_SUCCESSFUL: "security_user_password_changed_successful",
    FORGOT_PASSWORD_SUCCESSFUL: "security_user_forgot_password_successful",
    RESET_PASSWORD_SUCCESSFUL: "security_user_reset_password_successful"
  };

  isLoggedInSubject = new BehaviorSubject(false);
  getCurrentUserSubject = new BehaviorSubject<any>({});
  loggedInUser;
  localStorageKeys;
  userMockApi;

  model = {
    amount: 5,
    receiver: "",
    balance: 0,
    account: ""
  };
  accounts: string[];

  constructor(private messageService: MessageService, public router: Router,private http: HttpClient, private web3Service:Web3Service) {
    // this.localStorageKeys = localStorageKeys;
    this.getCurrentUser().subscribe();
    this.urls = urls;
    this.userMockApi = `${this.urls.JSON_SERVER}/users`;
  }

  getCurrentUser() {
    console.log("going to call getcurrent user");
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('user..........', user)
    let response;
    if (user) {
      response = { message: "User Session Available", details: user };
    } else {
      response = { message: "User Session Not Available", details: {} };
    }
    return of({}).pipe(
      map(() => {
        console.log("getcurrent response", response);
        const userDetails = response.details;
        if (user) {
          this.isLoggedInSubject.next(true);
          this.watchAccount();
          this.loggedInUser = userDetails
          this.getCurrentUserSubject.next(this.loggedInUser);
        } else {
          this.isLoggedInSubject.next(false);
        }
        return response;
      })
    );
  }

  getAllUsers() {
    console.log("getAllUsers");
    return this.http.get(this.userMockApi).pipe(
      map((res: any[]) => {
        return res;
      })
    );
  }
  getRequestById(id: number): Observable<any> {
    console.log('get User By id')
    return this.http.get<Request>(`${this.userMockApi}/${id}`);
  }

  login(form) {
    const email = form.email;
    const password = form.password;
    /** API Part begins */
    const userPresent = data.find(user => user.email === email);
    let response: ApiResponse;
    if (userPresent) {
      if (password === userPresent.password) {
        response = {
          message: this.codes.LOGIN_SUCCESFULL,
          details: {
            ...userPresent
          }
        };
      } else {
        response = {
          message: this.codes.PASSWORD_WRONG,
          details: null
        };
        return throwError(response);
      }
    } else {
      response = {
        message: this.codes.EMAIL_NOT_PRESENT,
        details: null
      };
      return throwError(response);
    }
    /** API Part ends */
    return of({}).pipe(
      map(() => {
        if (response.details) {
          localStorage.setItem('user', JSON.stringify(response.details));
          console.log('Set User in local Storage')
          console.log('get local storage', localStorage.getItem('user'))
          this.watchAccount();
          this.isLoggedInSubject.next(true);
          this.loggedInUser = response.details
          this.getCurrentUserSubject.next(this.loggedInUser);
        }
        return response;
      })
    );
  }

  logout() {
    console.log('logout')
    return of({}).pipe(
      map(() => {
        this.isLoggedInSubject.next(false);
        localStorage.removeItem("user");
        // this.router.navigate([this.urls.LOGIN]);
        console.log("logout");
      })
    );
  }

  register(form) {
    let response: ApiResponse;
    const userPresent = data.find(user => user.email === form.email);
    if (userPresent) {
      response = {
        message: this.codes.USER_ALREADY_REGISTERED,
        details: null
      };
      return throwError(response);
    } else {
      form.id = data.length + 1;
      data.push(form);
      response = {
        message: this.codes.USER_REGISTERED_SUCCESSFUL,
        details: form
      };
    }
    this.messageService.showSuccessMessage(response.message);
    return of(response);
  }

  changepassword(form) {
    const password = form.password;
    let response: ApiResponse;
    const loggedInUser = this.getCurrentUserSubject.value;
    /** API things */
    const userIndex = data.findIndex(
      user => user.email === loggedInUser.EMAIL_NOT_PRESENT
    );
    loggedInUser.password = password;
    data[userIndex] = loggedInUser;
    response = {
      message: this.codes.CHANGED_PASSWORD_SUCCESSFUL,
      details: loggedInUser
    };
    this.messageService.showSuccessMessage(response.message);
    return of(response);
  }

  forgotpassword(form) {
    const email = form.email;
    let response: ApiResponse;
    /** API  */
    const presentUser = data.find(user => user.email === email);
    if (presentUser) {
      response = {
        message: this.codes.FORGOT_PASSWORD_SUCCESSFUL,
        details: {}
      };
    } else {
      response = {
        message: this.codes.EMAIL_NOT_PRESENT,
        details: null
      };
      return throwError(response);
    }
    this.messageService.showSuccessMessage(response.message);
    return of(response);
  }

  resetpassword(form, email) {
    const password = form.password;
    let response: ApiResponse;
    /** API things */
    const userIndex = data.findIndex(user => user.email === email);
    data[userIndex].password = password;
    response = {
      message: this.codes.RESET_PASSWORD_SUCCESSFUL,
      details: data[userIndex]
    };
    this.messageService.showSuccessMessage(response.message);
    return of(response);
  }

  isLoggedIn() {
    console.log(" this.isLoggedInSubject.value;", this.isLoggedInSubject.value);
    return this.isLoggedInSubject.value;
  }

  watchAccount() {
    console.log("Watch Account Method is called...");
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      this.loggedInUser.blockchainAccount = accounts[0]
      this.getCurrentUserSubject.next(this.loggedInUser);
    });
  }
}
