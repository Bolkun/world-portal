import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { SetUserData } from 'src/app/components/dashboard/state/dashboard.action';
import { DashboardState } from 'src/app/components/dashboard/state/dashboard.state';

@Injectable({
  providedIn: 'root'
})
export class DashboardFacadeStateService {

  constructor(private readonly store: Store) { }

  getUserData(): Observable<any> {
    return this.store.select(DashboardState.getUserData);
  }

  setUser(action: any): Observable<unknown> {
    return this.store.dispatch(new SetUserData(action));
  }
}
