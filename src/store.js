
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './reducers/user'

export default configureStore({
  reducer: {
      user: userReducer
  }
})