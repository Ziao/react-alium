import { useContext } from "react";
import { AliumContext } from "./context";
import { registerConfig } from "./provider";
import { AliumActions, AliumConfig, AliumHook, AliumState } from "./types";

export const createStore = <S extends AliumState, A extends AliumActions>(
    config: AliumConfig<S, A>
): AliumHook<S, A> => {
    // add config to alium config, to be used within aliumProvider
    // create and return the hook

    registerConfig(config);

    // Explicitly naming this so react understands that it's safe to use hooks here
    return () => {
        // Retrieve the store from the context and return it
        const stores = useContext(AliumContext);
        if (!stores) throw new Error("No stores found. Did you wrap your app in <AliumProvider>?");
        const store = stores[config.id];
        if (!store) throw new Error(`No such store: '${config.id}'. Did you import the file that calls defineStore()?`);

        return store;
    };
};
