/* eslint no-param-reassign: ["error", {
      "props": true,
      "ignorePropertyModificationsFor": ["state"]
    }] */

export default {// 同步函数，遵循Vue同步规则
  clearUserInfo(state) {
    const { userInfo } = state;
    userInfo.info = null;
  },
  updateUserInfo(state, payload) {
    state.userInfo = payload;
  },
  updateRatesConf(state, payload) {
    state.ratesConf = payload;
  },
};
