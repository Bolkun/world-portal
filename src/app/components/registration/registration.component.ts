import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  @Output() goBackToLogin: EventEmitter<any> =
    new EventEmitter<any>();

    @Output() goToVerifyEmail: EventEmitter<any> =
    new EventEmitter<any>();

  constructor(
    public userService: UserService
  ) { }

  ngOnInit(): void { }

  backLogin() {
    this.goBackToLogin.emit();
  }

  async signUp(userNickname, userEmail, userPwd){
    await this.userService.SignUp(userNickname, userEmail, userPwd);
    this.goToVerifyEmail.emit();
  }

  async googleReg() {
    await this.userService.GoogleReg();
    this.goToVerifyEmail.emit();
  }
}
