import { Child1 } from "./Child";
import { useCandyStore } from "./lib/store";

function App() {
    const {
        updateState,
        state: { counter },
        actions: { increment },
    } = useCandyStore();

    return (
        <div className="container">
            <div className="card">
                Hello {counter}
                <br />
                <button onClick={() => updateState({ counter: counter - 1 })}>-1 (setState)</button>
                <button onClick={() => increment(3)}>+3 (action)</button>
            </div>
            <Child1 />
        </div>
    );
}

export default App;
