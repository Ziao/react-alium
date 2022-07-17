import { createContext, FunctionComponent, PropsWithChildren, useContext, useState } from "react";
import { bindActionsToStore } from "./util";

// export interface PuyaState2<S> extends Record<string, unknown> {} // complains about circular reference
export type PuyaState2<S> = { [key in keyof S]: typeof S[key] }; // do we even need this? are we going to add to this?

export type PuyaActions2 = Record<string, Function>;
// export type PuyaGetters2 = Record<string, Function>; // todo: state generic, this type here? or issues?

export interface PuyaStore2<S, A> {
    state: PuyaState2<S>;
    setState: (state: Partial<PuyaState2<S>>) => void;
    actions: PuyaActions2;
}

export interface PuyaConfig2<S extends PuyaState2<S>, A extends PuyaActions2 /*G extends PuyaGetters2*/> {
    id: string;
    initialState: () => S;
    // todo: think about whether actions should get actions to other actions? side effects? bad practices?
    actions?: A & ThisType<PuyaStore2<S, A>>;
    // getters?: G & ThisType<S>;
}

// Holds the actual stores
const PuyaContext = createContext<Record<string, any>>({});
PuyaContext.displayName = "PuyaContext";

// Holds the configs until they are used by the PuyaProvider component to actually create the stores
const puyaConfigs: PuyaConfig2<PuyaState2<unknown>, PuyaActions2>[] = [];

export const PuyaProvider: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => {
    // Init the global stuff here

    // key = puya store id, value = store object
    let stores: Record<string, any> = {};

    // Take all configured states so far (using createStore(), properly instantiate them here)
    for (const config of puyaConfigs) {
        // Todo: instead of useState'ing the whole state, do it for each prop to avoid rerenders
        const [state, setState] = useState(config.initialState());

        // Todo: abstract this out?
        const store: PuyaStore2<unknown, PuyaActions2> = {
            state,
            // we will overwrite the actions right after we initialised the store variable
            // so we can bind the store as their context
            actions: {},
            // Slightly enhance the setState function so that it can be passed a partial
            // state which will then be merged
            setState: (newState) => setState({ state, ...newState }),
        };

        // Set and bind the actions so that they receive the store as their `this` context
        if (config.actions) store.actions = bindActionsToStore(config.actions, store);

        // Save this store for later use through the store hooks
        stores[config.id] = store;
    }

    return <PuyaContext.Provider value={stores}>{children}</PuyaContext.Provider>;
};

const defineStore = <S extends PuyaState2<S>, A extends PuyaActions2>(config: PuyaConfig2<S, A>) => {
    // add config to puya config, to be used within puyaProvider
    // create and return the hook

    puyaConfigs.push(config);

    // Explicitly naming this so react understands that it's safe to use hooks here
    return () => {
        // Retrieve the store from the context and return it
        const stores = useContext(PuyaContext);
        if (!stores) throw new Error("No stores found. Did you wrap your app in <PuyaProvider>?");
        const store = stores[config.id];
        if (!store) throw new Error(`No such store: '${config.id}'. Did you import the file that calls defineStore()?`);

        return store;
    };
};

export const useCandyStore = defineStore({
    id: "candy",
    initialState: () => ({
        counter: 0,
    }),
    actions: {
        increment(amt = 1) {
            this.setState({ counter: this.state.counter + amt });
        },
    },
    // getters: {},
});
