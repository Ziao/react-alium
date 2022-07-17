import { createStore } from "./puya/createStore";

export const useFruitStore = createStore({
    initialState: () => ({
        fruitAvailable: 100,
        money: 50,
        a: 3,
    }),
    actions: {
        // `this` refers to the proxied store
        // Actions cannot use arrow functions due to `this`
        buyFruit(payload: { amount: number }) {
            const price = payload.amount * 5;
            if (payload.amount > this.fruitAvailable) return;
            if (price > this.money) return;

            this.fruitAvailable -= payload.amount;
            this.money -= price;
        },
    },
    getters: {
        // `this` refers to state only
        canBuyAmount() {
            return Math.min(this.fruitAvailable, this.money / 5);
        },
    },
});
