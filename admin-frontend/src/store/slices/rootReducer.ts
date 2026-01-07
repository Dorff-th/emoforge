// src/store/slices/index.ts
import { combineReducers } from "@reduxjs/toolkit";

import loadingReducer from './loadingSlice';

const rootReducer = combineReducers({

  loading: loadingReducer,

});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
