// Any generic called S = State = {counter: 0, ...}
// Any generic called As = Actions = {incrementCounter: (payload) => void, ...}
// Any generic called A = Action = (payload) => void
// Any generic called PAs = PuyaActions = {xxx: (this: S) => }

import { useEffect, useState } from "react";

// Todo
// - Batching
// - ^ Automatic batching, using setTimeout(xx, 0)
// - Only rerender on actual state change

export interface PuyaConfig<S, A extends PuyaActions, G extends PuyaGetters> {
    initialState: () => S;
    actions?: A & ThisType<PuyaStore<S, A, G>>;
    getters?: G & ThisType<PuyaStore<S, A, G>>;
}

export type PuyaActions = Record<string, Function>;
export type PuyaGetters = Record<string, Function>;
// export type PuyaStore<S, A> = {
//     $subscribe: (callback: (state: S) => void) => void;
//     $unsubscribe: (callback: (state: S) => void) => void;
// } & (S & A);
// export interface PuyaStore<S, A> {
//     state: S;
//     actions: A;
//     $subscribe: (callback: (state: S) => void) => void;
//     $unsubscribe: (callback: (state: S) => void) => void;
// }

export type PuyaStore<S, A, G> = {
    $subscribe: (callback: (state: S) => void) => void;
    $unsubscribe: (callback: (state: S) => void) => void;
} & (S & A & G);

// export type PuyaState<S> = { [key in keyof S]: typeof S[key] };
export type PuyaState<S> = {};
export type UsePuyaHook<S, A, G> = () => PuyaStore<S, A, G>;

export type PuyaSubscriber<S> = (state: S) => void;

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

    // const state = new Proxy(internalState, {
    //     // set(target: S, p: string | symbol, value: any, receiver: any): boolean {},
    //     set(obj, prop, value) {
    //         if (!(prop in obj)) throw new Error(`No such property in state: '${String(prop)}'`);
    //         obj[prop as keyof S] = value;
    //         // notify subscribers - todo: async/await?
    //         subscribers.forEach((subscriber) => subscriber(obj));
    //         return true;
    //     },
    // });

    // const state = config.initialState();
    // const actions = config.actions;

    // Slightly enhance the actions to always give them the state as the context (this)
    // Todo: maybe do this the same way, using a proxy, to bind the context to the actions on the fly (performance?)
    // for (const key in actions) {
    //     if (key in state) throw new Error(`Action '${key}' collides with a state property with the same name`);
    //
    //     // We are technically changing the config object here by modifying the actions.
    //     // If this causes issues we can assign these to a new, internal, actions object
    //     actions[key] = config.actions[key].bind(state);
    // }

    const subscribers: PuyaSubscriber<S>[] = [];

    const $subscribe = (subscriber: PuyaSubscriber<S>) => {
        subscribers.push(subscriber);
    };

    const $unsubscribe = (subscriber: PuyaSubscriber<S>) => {
        if (subscribers.includes(subscriber)) {
            subscribers.splice(subscribers.indexOf(subscriber), 1);
        }
    };

    // Note: this does not get updated.
    // Do not set/read from this after this. We only use this to check whether keys exist in the state.
    const internalState = config.initialState();

    const internalStore: PuyaStore<S, A, G> = {
        ...initialState,
        ...config.actions,
        ...config.getters,
        //     // setters
        //     // $(un)serialize?
        $subscribe,
        $unsubscribe,
    };

    const store = new Proxy<PuyaStore<S, A, G>>(internalStore, {
        set(target, prop, value) {
            // todo setter

            if (prop in initialState) {
                target[prop as keyof S] = value;
                // Note: we pass the proxied store, so further changes to the store will trigger subscribers again (sounds like a disaster)
                // Actually screw that ^
                subscribers.forEach((subscriber) => subscriber(internalStore));
                return true;
            }

            throw new Error(`No such property in state: '${String(prop)}'`);
        },
        get(target, prop): any {
            // todo: getters

            // get action, wrap it in a bind() to give it the store as context
            if (config.actions && prop in config.actions) {
                return config.actions[prop as keyof A].bind(store);
            }

            // get state
            if (prop in initialState) {
                return target[prop as keyof S];
            }

            // getters
            if (config.getters && prop in config.getters) {
                return config.getters[prop as keyof G].call(store);
            }

            // $functions (serialization, etc)
            if (String(prop).startsWith("$") && prop in internalStore) {
                return internalStore[prop as keyof typeof internalStore];
            }

            throw new Error(`No such property in state or actions: '${String(prop)}'`);
        },
    });

    const useStore = () => {
        // We use useState to create reactivity
        const [hookStore, setHookStore] = useState(store);

        // Create the subscriber (callback function) that will be called when the state changes
        // const subscriber: PuyaSubscriber<S> = (state) => setHookStore(store);
        const subscriber: PuyaSubscriber<S> = (state) => {
            console.log("subscriber", state);
            // setHookStore(store); // doesnt rerender - same object?
            setHookStore({ ...store }); // doesnt rerender - same object?
        };

        // Subscribe on mount
        useEffect(() => $subscribe(subscriber));

        // Unsubscribe on unmount
        useEffect(() => () => $unsubscribe(subscriber));

        return hookStore;
    };

    return useStore;
};
