export type AliumState = Record<string, unknown>;
export type AliumActions = Record<string, Function>;

export interface AliumStore<S, A> {
    state: S;
    updateState: (state: Partial<S>) => void;
    actions: AliumActions;
}

export interface AliumConfig<S extends AliumState, A extends AliumActions /*G extends AliumGetters2*/> {
    id: string;
    initialState: () => S;
    // todo: think about whether actions should get access to other actions? side effects? bad practices? should we only pass state?
    actions?: A & ThisType<AliumStore<S, A>>;
    // todo: implement getters
    // getters?: G & ThisType<S>;
}

export type AliumHook<S, A> = () => AliumStore<S, A>;
