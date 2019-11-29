import { Component } from "@angular/core";
import { AuthService } from "./auth/auth.service";
import { AuthMockService } from "./auth/auth.mock.service";
import { Router } from "@angular/router";
import { urls } from "./shared/constant";
import { Web3Service } from './util/web3.service';
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "Battlefield";
  urls;
  message;
  isLoggedIn;

  constructor(private authService: AuthMockService, private router: Router) {}

  ngOnInit() {
    this.urls = urls;
    this.authService.isLoggedInSubject.subscribe(value => {
      this.isLoggedIn = value;
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate([this.urls.LOGIN]);
    });
  }


}
