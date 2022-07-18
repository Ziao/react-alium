import { FunctionComponent, PropsWithChildren, useState } from "react";
import { AliumContext } from "./context";
import { AliumActions, AliumConfig, AliumState, AliumStore } from "./types";
import { bindActionsToStore } from "./util";

// Holds the configs until they are used by the AliumProvider component to actually create the stores
const aliumConfigs: AliumConfig<AliumState, AliumActions>[] = [];

export const registerConfig = (config: AliumConfig<AliumState, AliumActions>) => {
    aliumConfigs.push(config);
};

export const AliumProvider: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => {
    // Init the global stuff here

    // key = alium store id, value = store object
    let stores: Record<string, any> = {};

    // Take all configured states so far (using createStore(), properly instantiate them here)
    for (const config of aliumConfigs) {
        // Todo: instead of useState-ing the whole thing, do it on a prop basis to avoid re-renders
        // setState could then call the setX function for each prop that was specified in the partial state
        const [state, setState] = useState(config.initialState());

        // Todo: abstract this out?
        const store: AliumStore<AliumState, AliumActions> = {
            state,
            // we will overwrite the actions right after we initialised the store variable
            // so we can bind the store as their context
            actions: {},
            // Slightly enhance the setState function so that it can be passed a partial
            // state which will then be merged
            updateState: (newState) => setState({ state, ...newState }),
        };

        // Set and bind the actions so that they receive the store as their `this` context
        if (config.actions) store.actions = bindActionsToStore(config.actions, store);

        // Save this store for later use through the store hooks
        stores[config.id] = store;
    }

    return <AliumContext.Provider value={stores}>{children}</AliumContext.Provider>;
};
