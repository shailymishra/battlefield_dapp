import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Battlefield';

  message;
  isLoggedIn;
  constructor(private authService : AuthService) { }

  ngOnInit() {
    this.authService._isLoggedIn.subscribe((value)=>{
      this.isLoggedIn = value;
    });
  }

}
