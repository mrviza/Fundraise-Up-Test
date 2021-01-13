import Vue from "vue";
import App from "./App.vue";
import VueToast from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

Vue.config.productionTip = false;

Vue.filter("divideByThree", function(value: string | number): string {
  let stringValue = value;

  if (typeof stringValue !== "string") {
    const roudedValue = Math.round(stringValue);
    stringValue = roudedValue.toString();
  }

  const clearValue = stringValue.split(",").join("");
  const len = clearValue.length;

  let newValueArr = [];
  for (let i = len - 1; i >= 0; i--) {
    if (i !== len - 1 && (len - i - 1) % 3 === 0) {
      newValueArr.push(",");
    }

    const alpha = clearValue[i];
    newValueArr.push(alpha);
  }

  const newValue = newValueArr.reverse().join("");
  return newValue;
});

Vue.use(VueToast);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
