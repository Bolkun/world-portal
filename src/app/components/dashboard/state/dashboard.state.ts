import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import produce, { enableMapSet } from 'immer';
import { SetUserData } from './dashboard.action';

export const CHANNEL_STATE_NAME = 'dashboard';
export interface IDashboardState {
  userData: any;
}

export function initialState(): IDashboardState {
  return {
    userData: undefined,
  };
}

@State<IDashboardState>({
  name: CHANNEL_STATE_NAME,
  defaults: initialState(),
})
@Injectable()
export class DashboardState {
  @Selector()
  static getUserData(userData: IDashboardState): any {
    return userData.userData;
  }

  constructor(
  ) { }

  @Action(SetUserData)
  editPostingById({ getState, setState }: StateContext<IDashboardState>, action: SetUserData) {
    setState(
      produce(getState(), (userDraft) => {
        userDraft.userData = action;
      })
    )
  }
}
