import { useCandyStore } from "./lib/store";

export const Child1 = () => {
    const {
        updateState,
        state: { counter },
        actions: { increment },
    } = useCandyStore();

    return <div className="card">Counter: {counter}</div>;
};
