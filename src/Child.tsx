import { useCandyStore } from "./lib/puya/provider";

export const Child1 = () => {
    const {
        setState,
        state: { counter },
        actions: { increment },
    } = useCandyStore();

    console.log("child1 render");

    return (
        <div className="card">
            Counter: {counter}
            {/*<button onClick={() => setState({ counter: counter - 1 })}>-1 (setState)</button>*/}
        </div>
    );
};

export const Child2 = () => {
    const {
        actions: { increment },
    } = useCandyStore();

    console.log("child1 render");

    return (
        <div className="card">
            <button onClick={() => increment(3)}>Increment</button>
        </div>
    );
};
