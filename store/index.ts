import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
const store = new Vuex.Store<{ value: string; dollarValue: number }>({
  state: {
    value: "",
    dollarValue: 0,
  },
  mutations: {
    setValue(state, value: string): void {
      state.value = value;
    },
    setDollarValue(state, dollarValue: number): void {
      state.dollarValue = dollarValue;
    },
  },
  actions: {
    updateValue(context, value: string): void {
      context.commit("setValue", value);
    },
    updateDollarValue(context, dollarValue: number): void {
      context.commit("setDollarValue", dollarValue);
    },
  },
});

export default store;
