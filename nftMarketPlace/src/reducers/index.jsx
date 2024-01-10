const INITAL_STATE = {
    wallet: ``,
    address: ``
  };
  
  const reducer = (state = INITAL_STATE, action) => {
    switch (action.type) {
      case "CONNECT":
        return {
          ...state,
          wallet: action.payload.wallet,
          address: action.payload.address
        };
      default:
        return state;
    }
  };
  export default reducer;