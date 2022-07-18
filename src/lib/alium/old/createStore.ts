// import { useEffect, useState } from "react";
//
// // Todo
// // - Batching
// // - ^ Automatic batching, using setTimeout(xx, 0)
// // - Only rerender on actual state change
// // - Handle array.push etc (means each state prop needs to be a proxy?)
// // - Make sure we handle getters, as in, update them too when a dependent state changes
//
// export interface AliumConfig<S, A extends AliumActions, G extends AliumGetters> {
//     id: string;
//     initialState: () => S;
//     actions?: A & ThisType<AliumStore<S, A, G>>;
//     getters?: G & ThisType<S>;
// }
//
// export type AliumActions = Record<string, Function>;
// export type AliumGetters = Record<string, Function>; // todo: state generic, this type here? or issues?
//
// export type AliumStore<S, A, G> = AliumUtils<S> & S & A & G;
//
// // export type AliumState<S> = { [key in keyof S]: typeof S[key] };
// export type AliumState<S> = {};
// export type UseAliumHook<S, A, G> = () => AliumStore<S, A, G>;
// export type AliumSubscriber<S> = (state: S, props: [keyof S]) => void;
//
// export interface AliumUtils<S> {
//     $subscribe: (callback: (state: S) => void) => void;
//     $unsubscribe: (callback: (state: S) => void) => void;
// }
//
// /**
//  * Create a Alium store. You will want to assign the output of this to a variable called use[Name]Store.
//  * Refer to the AliumConfig interface for configuration options.
//  * @example
//  *     const useFruitStore = createStore({...})
//  */
// export const createStore = <S extends AliumState<S>, A extends AliumActions, G extends AliumGetters>(
//     config: AliumConfig<S, A, G>
// ): UseAliumHook<S, A, G> => {
//     // Disallow tampering with the config after this point
//     Object.freeze(config);
//
//     // Slightly enhance the actions to always give them the state as the context (this)
//     // Todo: maybe do this the same way, using a proxy, to bind the context to the actions on the fly (performance?)
//     // for (const key in actions) {
//     //     if (key in state) throw new Error(`Action '${key}' collides with a state property with the same name`);
//     //
//     //     // We are technically changing the config object here by modifying the actions.
//     //     // If this causes issues we can assign these to a new, internal, actions object
//     //     actions[key] = config.actions[key].bind(state);
//     // }
//
//     const state = config.initialState();
//     const actions = config.actions; // todo: 'map' these and bind store here?
//     const getters = config.getters;
//
//     const subscribers: AliumSubscriber<S>[] = [];
//
//     const utils: AliumUtils<S> = {
//         $subscribe: (subscriber: AliumSubscriber<S>) => {
//             subscribers.push(subscriber);
//         },
//         $unsubscribe: (subscriber: AliumSubscriber<S>) => {
//             if (subscribers.includes(subscriber)) {
//                 subscribers.splice(subscribers.indexOf(subscriber), 1);
//             }
//         },
//         // todo: serialize?
//     };
//
//     const internalStore: AliumStore<S, A, G> = {
//         ...state,
//         ...actions,
//         ...getters,
//         ...utils,
//     };
//
//     const store = new Proxy<AliumStore<S, A, G>>(
//         // We use getters and setters to ensure AliumStore is fully implemented.
//         internalStore,
//         {
//             set(_, prop, value) {
//                 // todo setter
//
//                 if (prop in state) {
//                     state[prop as keyof S] = value;
//                     subscribers.forEach((subscriber) => subscriber(state, [prop]));
//                     return true;
//                 }
//
//                 throw new Error(`No such property in state: '${String(prop)}'`);
//             },
//             get(_, prop): any {
//                 // todo:  put this util stuff in a const called utils and handle them the same.
//                 if (prop in utils) {
//                     return utils[prop as keyof typeof utils].bind(state);
//                 }
//
//                 // get action, wrap it in a bind() to give it the store as context
//                 if (actions && prop in actions) {
//                     return actions[prop as keyof A].bind(store);
//                 }
//
//                 // get state
//                 if (prop in state) {
//                     return state[prop as keyof S];
//                 }
//
//                 // getters
//                 if (getters && prop in getters) {
//                     return getters[prop as keyof G].call(state);
//                 }
//
//                 throw new Error(`No such property in state or actions: '${String(prop)}'`);
//             },
//         }
//     );
//
//     const useStore = () => {
//         // We use useState to create reactivity
//         const [hookStore, setHookStore] = useState(store);
//
//         // Create the subscriber (callback function) that will be called when the state changes
//         // const subscriber: AliumSubscriber<S> = (state) => setHookStore(store);
//         const subscriber: AliumSubscriber<S> = (state) => {
//             console.log("subscriber called with", { state }, store);
//             // setHookStore(store); // doesnt rerender - same object?
//             setHookStore({ ...store }); // kind of works - give you the proxy's target (so setters won't work)
//         };
//
//         // Subscribe on mount
//         useEffect(() => utils.$subscribe(subscriber));
//
//         // Unsubscribe on unmount
//         useEffect(() => () => utils.$unsubscribe(subscriber));
//
//         return hookStore;
//     };
//
//     return useStore;
// };
//
// const useStateToReact = <S extends AliumState<S>>(state: S): S => state;
