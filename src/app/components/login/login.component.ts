import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  routingsComponent: any =
    {
      login: true,
      registration: false,
      registrationVerify: false,
      forgotPassword: false,
      verifyEmail: false
    }
  constructor(
    public userService: UserService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    // redirect if user logged in
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['dashboard']);
    }
  }

  openRegistration() {
    this.openPage('registration');
  }

  public openPage(event) {
    switch (event) {
      case 'login':
        this.routingsComponent.login = true;
        this.routingsComponent.registration = false;
        this.routingsComponent.registrationVerify = false;
        this.routingsComponent.forgotPassword = false;
        this.routingsComponent.verifyEmail = false;
        break;

      case 'registration':
        this.routingsComponent.login = false;
        this.routingsComponent.registration = true;
        this.routingsComponent.registrationVerify = false;
        this.routingsComponent.forgotPassword = false;
        this.routingsComponent.verifyEmail = false;
        break;

      case 'registrationVerify':
        this.routingsComponent.login = false;
        this.routingsComponent.registration = false;
        this.routingsComponent.registrationVerify = true;
        this.routingsComponent.forgotPassword = false;
        this.routingsComponent.verifyEmail = false;
        break;

      case 'forgotPassword':
        this.routingsComponent.login = false;
        this.routingsComponent.registration = false;
        this.routingsComponent.registrationVerify = false;
        this.routingsComponent.forgotPassword = true;
        this.routingsComponent.verifyEmail = false;
        break;

      case 'verifyEmail':
        this.routingsComponent.login = false;
        this.routingsComponent.registration = false;
        this.routingsComponent.registrationVerify = false;
        this.routingsComponent.forgotPassword = false;
        this.routingsComponent.verifyEmail = true;
        break;

      default:
        break;
    }
  }

}
