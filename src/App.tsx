import { useEffect } from "react";
import { useFruitStore } from "./lib/store";

function App() {
    const { fruitAvailable, money, buyFruit, canBuyAmount } = useFruitStore();

    useEffect(() => {
        console.log("App rendered", fruitAvailable);
    }, [fruitAvailable]);

    return (
        <div className="container">
            <div className="card">
                <h3>Fruits available: {fruitAvailable}</h3>
            </div>
            <div className="card">
                <h3>Money: ${money}</h3>
            </div>
            <div className="card">
                <h3>Can buy: {canBuyAmount} fruit</h3>
                <button onClick={() => buyFruit({ amount: 1 })}>Buy 1 fruit</button>
                <button onClick={() => buyFruit({ amount: 5 })}>Buy 5 fruit</button>
            </div>
        </div>
    );
}

export default App;
