import { Platform } from '@angular/cdk/platform';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { DashboardFacadeStateService } from './services/dashboard/dashboard-facade-state.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'weltportale';

  constructor(private router: Router, private userService: UserService, private dashboardFacadeState: DashboardFacadeStateService) {
  }

  ngOnInit() {
    const existStorageID = localStorage.getItem('userID');
    if (existStorageID) {
      this.userService.GetUserData(existStorageID).pipe(take(1)).subscribe(res => {
        this.dashboardFacadeState.setUser(res);
      })
    }
  }

  hasRoute(route: string) {
    return this.router.url.includes(route);
  }
}
