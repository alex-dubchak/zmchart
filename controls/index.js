import { accounts } from "./accounts.js";
import { duration } from "./duration.js";

const controls = {
    duration,
    accounts,
    async build() {
        console.debug('building controls');
        const controls = Object.values(this).filter(val => typeof val !== 'function');
        for (const control of controls) {
            await control.build();
        }
    }
}

export {
    controls
}