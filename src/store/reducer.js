import * as Types from "./types";

const initialState = {
  user: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case Types.loginUser:
      return { ...state, user: action.payload.user };
    default:
      return state;
  }
};

export default reducer;
