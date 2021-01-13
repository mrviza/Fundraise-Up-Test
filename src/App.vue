<template>
  <div id="app">
    <div class="fund-form">
      <div class="presets">
        <button
          class="presets__button"
          v-for="(preset, id) in presets"
          :class="{ '--active': calcPresetValue(id) === value }"
          :key="id"
          @click="setValue(preset)"
        >
          {{ selectedCurrency.symbol }}
          {{ calcPresetValue(id) }}
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
        <button class="submit" type="submit" :disabled="numValue < 1">
          Donate
        </button>
      </form>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// eslint-disable-next-line
import { ToastApi } from "vue-toast-notification/types/toast";
import axios from "axios";

interface Currency {
  name: string;
  code: string;
  symbol: string;
  rate: number;
}

declare module "vue/types/vue" {
  interface VueConstructor {
    $toast: ToastApi;
  }

  interface Vue {
    $toast: ToastApi;
  }
}

@Component
export default class App extends Vue {
  private suggestion = 40;

  public currencies: Currency[] = [
    { name: "US Dollar", code: "USD", symbol: "$", rate: 1 },
    { name: "Euro", code: "EUR", symbol: "€", rate: 0.897597 },
    { name: "British Pound", code: "GBP", symbol: "£", rate: 0.81755 },
    { name: "Russian Ruble", code: "RUB", symbol: "₽", rate: 63.461993 },
  ];
  public presets = [40, 100, 200, 1000, 2500, 5000];
  public value = "";
  public selectedCurrency: null | Currency = null;
  public dollarValue = 40;

  /**
   * Калькулируемое свойства, возвращающее сумму ввиде числа
   */
  get numValue() {
    const clearValue = this.value.split(",").join("");
    const numValue = parseInt(clearValue);

    return numValue;
  }

  created() {
    this.value = this.divideByThreeFn(this.suggestion);
    this.dollarValue = this.suggestion;
    this.selectedCurrency = Object.assign({}, this.currencies[0]);
  }

  /**
   * Метод, типизирующий фильтр
   * Фильтр добавляет разделители для суммы
   */
  private divideByThreeFn(value: number | string): string {
    if (!this.$options.filters || !this.$options.filters.divideByThree) {
      return value.toString();
    }

    const fn = this.$options.filters.divideByThree as (
      value: number | string
    ) => string;

    return fn(value);
  }

  /**
   * Метод, делающий значения суммы красивыми
   */
  private calcPrettyValue(value: number): number {
    const roundedValue = Math.round(value);
    const length = roundedValue.toString().length;
    const pow = Math.pow(10, length - 2);
    const scale = pow < 10 ? 10 : 5 * pow;
    const delimer = Math.ceil(roundedValue / scale);
    const newValue = delimer * scale;

    return newValue;
  }

  /**
   * Обработчик события блюр
   * Фиксирует значение в валюте по умолчанию, на случай пересчета в другие валюты
   */
  public checkValue(): void {
    if (!this.selectedCurrency) return;

    this.dollarValue = Math.round(this.numValue / this.selectedCurrency.rate);
  }

  /**
   * Обработчик клика по подсказке
   * Выставляет значение суммы согласно подсказке
   */
  public setValue(value: number): void {
    if (!this.selectedCurrency) {
      return;
    }

    const rate = this.selectedCurrency.rate;
    const rawValue = value * rate;
    const calculatedValue = this.calcPrettyValue(rawValue);

    this.dollarValue = value;
    this.value = this.divideByThreeFn(calculatedValue);
  }

  /**
   * Метод отправки формы
   */
  public async submitForm(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.selectedCurrency) {
      return;
    }

    const url = process.env.VUE_APP_API_URL;
    const endpoint = `${url}/donate`;
    const res = await axios.post(endpoint, {
      amount: this.numValue,
      currency: this.selectedCurrency.code,
    });

    if (res.status === 200) {
      window.alert("Thank you for your donation!");
    } else {
      this.$toast.open({
        message: "Some problem on server-side",
        type: "error",
        position: "top",
        dismissible: false,
      });
    }
  }

  /**
   * Обработчик дропменю
   * Меняет валюту на выбранную
   * Если сумма соответствует одной из подсказок, пересчитывает сумму
   */
  public selectCurrency(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const id = parseInt(target.value);
    const newCurrency = Object.assign({}, this.currencies[id]);
    const newValue = this.dollarValue * newCurrency.rate;

    this.selectedCurrency = newCurrency;

    if (this.presets.includes(this.dollarValue)) {
      const roundedValue = this.calcPrettyValue(newValue);
      const dividedValue = this.divideByThreeFn(roundedValue);

      this.value = dividedValue;
    } else {
      this.value = this.divideByThreeFn(newValue);
    }
  }

  /**
   * Метод, рассчитывающий значение подсказок, на основе выбранной валюты
   */
  public calcPresetValue(id: number): string {
    const value = this.presets[id];

    if (!this.selectedCurrency) return this.divideByThreeFn(value);

    const rate = this.selectedCurrency.rate;
    const rawValue = value * rate;
    const calculatedValue = this.calcPrettyValue(rawValue);
    const dividedValue = this.divideByThreeFn(calculatedValue);

    return dividedValue;
  }

  /**
   * Хендер ввода, блокирующий любые значения кроме цифр
   */
  public preventNotNumbers(event: KeyboardEvent): void {
    const re = new RegExp(/[0-9]{1}/);

    if (!re.test(event.key)) event.preventDefault();
  }

  /**
   * Хендер ввода, добавляющий разделители при вводе суммы
   */
  public prettifyValue(event: InputEvent): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const newValue = this.divideByThreeFn(value);
    this.value = newValue;
  }
}
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

    .presets {
      display: grid;
      grid-template-columns: repeat(3, 100px);
      grid-gap: 10px;

      &__button {
        background-image: linear-gradient(to bottom, #fff 0, #f9f9f9 100%);
        background-repeat: repeat-x;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        height: 40px;
        font-size: 18px;
        line-height: 23px;
        font-weight: 400;
        padding: 0 2px;
        margin: 0;
        border: 0;
        border-radius: 5px;
        width: 100%;
        outline: none;
      }

      .--active {
        background: #2e71d5;
        color: #fff;
      }
    }

    form {
      padding: 24px 0;
      width: 100%;

      .input {
        width: 320px;
        display: flex;
        justify-content: space-between;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        border-radius: 5px;
        background: #fff;
        margin-bottom: 20px;

        &__currency {
          font-size: 21px;
          line-height: 50px;
          width: 40px;
          font-weight: 400;
          vertical-align: middle;
          text-align: center;
        }

        &__field {
          border: none;
          background: #fff;
          line-height: 48px;
          font-size: 40px;
          vertical-align: middle;
          width: 200px;
          outline: none;
        }

        &__select {
          border: none;
          margin: 0 10px;
          outline: none;
        }
      }

      .submit {
        background: #4c85db;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        height: 40px;
        font-size: 18px;
        line-height: 23px;
        font-weight: 400;
        padding: 0 2px;
        margin: 0;
        border: 0;
        border-radius: 5px;
        width: 100%;

        &:hover {
          background: #2e71d5;
          cursor: pointer;
        }

        &:disabled {
          background-image: linear-gradient(to bottom, #fff 0, #f9f9f9 100%);
          background-repeat: repeat-x;
          cursor: initial;
        }
      }
    }
  }
}
</style>
