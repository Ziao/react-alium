import { createStore } from "./puya/createStore";

export const useFruitStore = createStore({
    initialState: () => ({
        fruitAvailable: 100,
        money: 50,
        a: 3,
    }),
    actions: {
        // Actions cannot use arrow functions due to `this` referring to state
        buyFruit(payload: { amount: number }) {
            const price = payload.amount * 5;
            if (payload.amount > this.fruitAvailable) return;
            if (price > this.money) return;

            this.fruitAvailable -= payload.amount;
            this.money -= price;
        },
    },
    getters: {
        canBuyAmount() {
            // this.
            return Math.min(this.fruitAvailable, this.money / 5);
        },
    },
    // setters?
});

// Get rid of bind - should be done in createStore

// todo: no payload completion
// useFruitStore().actions.buyFruit.bind(useFruitStore().state)({ amount: 1, reason: 1 });
