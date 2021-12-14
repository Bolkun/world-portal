import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  @Output() goBackToLogin: EventEmitter<any> =
  new EventEmitter<any>();

  constructor(
    public userService: UserService
  ) { }

  ngOnInit(): void {}

  backLogin() {
    this.goBackToLogin.emit();
  }
}
