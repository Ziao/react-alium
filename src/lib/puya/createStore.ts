import { useEffect, useState } from "react";

// Todo
// - Batching
// - ^ Automatic batching, using setTimeout(xx, 0)
// - Only rerender on actual state change
// - Handle array.push etc (means each state prop needs to be a proxy?)

export interface PuyaConfig<S, A extends PuyaActions, G extends PuyaGetters> {
    initialState: () => S;
    actions?: A & ThisType<PuyaStore<S, A, G>>;
    getters?: G & ThisType<S>;
}

export type PuyaActions = Record<string, Function>;
export type PuyaGetters = Record<string, Function>; // todo: state generic, this type here? or issues?

export type PuyaStore<S, A, G> = PuyaUtils<S> & S & A & G;

// export type PuyaState<S> = { [key in keyof S]: typeof S[key] };
export type PuyaState<S> = {};
export type UsePuyaHook<S, A, G> = () => PuyaStore<S, A, G>;
export type PuyaSubscriber<S> = (state: S, props: [keyof S]) => void;

export interface PuyaUtils<S> {
    $subscribe: (callback: (state: S) => void) => void;
    $unsubscribe: (callback: (state: S) => void) => void;
}

/**
 * Create a Puya store. You will want to assign the output of this to a variable called use[Name]Store.
 * Refer to the PuyaConfig interface for configuration options.
 * @example
 *     const useFruitStore = createStore({...})
 */
export const createStore = <S extends PuyaState<S>, A extends PuyaActions, G extends PuyaGetters>(
    config: PuyaConfig<S, A, G>
): UsePuyaHook<S, A, G> => {
    // Disallow tampering with the config after this point
    Object.freeze(config);

    // Slightly enhance the actions to always give them the state as the context (this)
    // Todo: maybe do this the same way, using a proxy, to bind the context to the actions on the fly (performance?)
    // for (const key in actions) {
    //     if (key in state) throw new Error(`Action '${key}' collides with a state property with the same name`);
    //
    //     // We are technically changing the config object here by modifying the actions.
    //     // If this causes issues we can assign these to a new, internal, actions object
    //     actions[key] = config.actions[key].bind(state);
    // }

    const state = config.initialState();
    const actions = config.actions; // todo: 'map' these and bind store here?
    const getters = config.getters;

    const subscribers: PuyaSubscriber<S>[] = [];

    const utils: PuyaUtils<S> = {
        $subscribe: (subscriber: PuyaSubscriber<S>) => {
            subscribers.push(subscriber);
        },
        $unsubscribe: (subscriber: PuyaSubscriber<S>) => {
            if (subscribers.includes(subscriber)) {
                subscribers.splice(subscribers.indexOf(subscriber), 1);
            }
        },
        // todo: serialize?
    };

    const internalStore: PuyaStore<S, A, G> = {
        ...state,
        ...actions,
        ...getters,
        ...utils,
    };

    const store = new Proxy<PuyaStore<S, A, G>>(
        // We use getters and setters to ensure PuyaStore is fully implemented.
        internalStore,
        {
            set(_, prop, value) {
                // todo setter

                if (prop in state) {
                    state[prop as keyof S] = value;
                    subscribers.forEach((subscriber) => subscriber(state, [prop]));
                    return true;
                }

                throw new Error(`No such property in state: '${String(prop)}'`);
            },
            get(_, prop): any {
                // todo:  put this util stuff in a const called utils and handle them the same.
                if (prop in utils) {
                    return utils[prop as keyof typeof utils].bind(state);
                }

                // get action, wrap it in a bind() to give it the store as context
                if (actions && prop in actions) {
                    return actions[prop as keyof A].bind(store);
                }

                // get state
                if (prop in state) {
                    return state[prop as keyof S];
                }

                // getters
                if (getters && prop in getters) {
                    return getters[prop as keyof G].call(state);
                }

                throw new Error(`No such property in state or actions: '${String(prop)}'`);
            },
        }
    );

    const useStore = () => {
        // We use useState to create reactivity
        const [hookStore, setHookStore] = useState(store);

        // Create the subscriber (callback function) that will be called when the state changes
        // const subscriber: PuyaSubscriber<S> = (state) => setHookStore(store);
        const subscriber: PuyaSubscriber<S> = (state) => {
            console.log("subscriber called with", { state }, store);
            // setHookStore(store); // doesnt rerender - same object?
            setHookStore({ ...store }); // kind of works - give you the proxy's target (so setters won't work)
        };

        // Subscribe on mount
        useEffect(() => utils.$subscribe(subscriber));

        // Unsubscribe on unmount
        useEffect(() => () => utils.$unsubscribe(subscriber));

        return hookStore;
    };

    return useStore;
};

const useStateToReact = <S extends PuyaState<S>>(state: S): S => state;
