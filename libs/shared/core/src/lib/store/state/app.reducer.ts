import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app.state';
import { authReducer } from '../auth';

export const appReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
};

