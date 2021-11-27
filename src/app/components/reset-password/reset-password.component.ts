import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  @Output() goBackToLogin: EventEmitter<any> =
    new EventEmitter<any>();
  constructor(
    public userService: UserService
  ) { }

  ngOnInit(): void { }

  backLogin() {
    this.goBackToLogin.emit();
  }
}
