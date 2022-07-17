import { PuyaActions2 } from "./provider";

export const bindActionsToStore = <C>(actions: PuyaActions2, context: C) => {
    return Object.keys(actions).reduce((newActions, actionName) => {
        newActions[actionName] = actions[actionName].bind(context);
        return newActions;
    }, {} as typeof actions);
};
