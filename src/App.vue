<template>
  <div id="app">
    <div class="fund-form">
      <div class="presets">
        <button
          class="preset__button"
          v-for="(preset, id) in presets"
          :class="{ '--active': preset === value }"
          :key="id"
          @click="setValue(preset)"
        >
          {{ selectedCurrency.symbol }}
          {{ calcPresetValue(id) | divideByThree }}
        </button>
      </div>
      <form @submit="submitForm">
        <div class="input">
          <span class="input__currency">{{ selectedCurrency.symbol }}</span>
          <input
            class="input__field"
            type="text"
            v-model="value"
            @blur="checkValue"
            @keypress.enter.prevent
            @keypress="preventNotNumbers"
            @input="prettifyValue"
          />
          <select class="input__select" @change="selectCurrency">
            <option
              v-for="(currency, id) in currencies"
              :value="id"
              :key="id"
              >{{ currency.code }}</option
            >
          </select>
        </div>
        <button type="submit">
          Donate
        </button>
      </form>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: "App",
  filters: {
    divideByThree(value: string | number): string {
      let stringValue = value;

      if (typeof stringValue !== "string") {
        stringValue = value.toString();
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
    },
  },
  data() {
    return {
      currencies: [
        { name: "US Dollar", code: "USD", symbol: "$", rate: 1 },
        { name: "Euro", code: "EUR", symbol: "€", rate: 0.897597 },
        { name: "British Pound", code: "GBP", symbol: "£", rate: 0.81755 },
        { name: "Russian Ruble", code: "RUB", symbol: "₽", rate: 63.461993 },
      ],
      presets: [40, 100, 200, 1000, 2500, 5000],
      suggestion: 40,
      dollarValue: 40,
      value: 40,
      selectedCurrency: undefined,
    };
  },
  created() {
    this.value = this.$options.filters.divideByThree(this.suggestion);
    this.selectedCurrency = this.currencies[0];
  },
  methods: {
    checkValue(event) {
      const value = event.target.value;
      const clearValue = value.split(",").join("");
      const numValue = parseInt(clearValue);

      this.dollarValue = Math.round(numValue / this.selectedCurrency.rate);
      const roundedValue = this.calcPrettyValue(numValue);
      this.value = this.$options.filters.divideByThree(roundedValue);
    },
    setValue(value): void {
      this.value = this.$options.filters.divideByThree(value);
    },
    submitForm() {
      console.log("submit");
    },
    selectCurrency(event) {
      const id = event.target.value;
      const newCurrency = this.currencies[id];
      const newValue = this.dollarValue * newCurrency.rate;

      this.selectedCurrency = newCurrency;

      if (this.presets.includes(this.dollarValue)) {
        const roundedValue = this.calcPrettyValue(newValue);
        this.value = this.$options.filters.divideByThree(roundedValue);
      } else {
        this.value = Math.round(newValue);
      }
    },

    calcPresetValue(id) {
      const value = this.presets[id];

      if (!this.selectedCurrency) return value;

      const rate = this.selectedCurrency.rate;
      const rawValue = value * rate;

      const calculatedValue = this.calcPrettyValue(rawValue);

      return calculatedValue;
    },
    calcPrettyValue(value) {
      const roundedValue = Math.round(value);
      const length = roundedValue.toString().length;
      const pow = Math.pow(10, length - 2);
      const scale = pow < 10 ? 10 : 5 * pow;
      const delimer = Math.ceil(roundedValue / scale);
      const newValue = delimer * scale;

      return newValue;
    },
    preventNotNumbers(event) {
      const re = new RegExp(/[0-9]{1}/);

      if (!re.test(event.key)) event.preventDefault();
    },
    prettifyValue(event) {
      const value = event.target.value;
      const newValue = this.$options.filters.divideByThree(value);
      this.value = newValue;
    },
  },
};
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  display: flex;
  justify-content: center;

  margin-top: 60px;
  width: 100%;

  .fund-form {
    color: #515151;
    background-color: #f5f5f7;
    padding: 24px 48px;
    border-radius: 16px;
  }
}
</style>
