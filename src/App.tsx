import { Child1 } from "./Child";
import { useCandyStore } from "./lib/puya/provider";

function App() {
    const {
        setState,
        state: { counter },
        actions: { increment },
    } = useCandyStore();

    console.log("App render");

    return (
        <div className="container">
            <div className="card">
                {/*Hello {counter}*/}
                <br />
                <button onClick={() => setState({ counter: counter - 1 })}>-1 (setState)</button>
                <button onClick={() => increment(3)}>+3 (action)</button>
            </div>
            <Child1 />
        </div>
    );
}

export default App;
