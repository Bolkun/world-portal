import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private user$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  destroy$: Subject<void> = new Subject<void>();
  constructor() { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setUserData(action) {
    this.user$.next(action);
    this.user$.subscribe(res=> {
      // console.log(res);
    })
    // return this.user$.asObservable();
    return of(this.user$);
  }
}
