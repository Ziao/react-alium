import { AliumActions } from "./types";

export const bindActionsToStore = <C>(actions: AliumActions, context: C) => {
    return Object.keys(actions).reduce((newActions, actionName) => {
        newActions[actionName] = actions[actionName].bind(context);
        return newActions;
    }, {} as typeof actions);
};
