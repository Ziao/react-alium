export class CollusionHandler {
    keys: Record<string, string[]> = {};

    addKeys(scope: string, keys: string[]) {
        this.keys[scope] = keys;
    }
}
