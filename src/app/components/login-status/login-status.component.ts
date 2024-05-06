import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css'
})
export class LoginStatusComponent implements OnInit {

  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService) {}

  ngOnInit(): void {
  }

  getUserDetails() {
  }

  logout() {
  }

}
