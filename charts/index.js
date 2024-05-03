import {
    overallChart
} from './overall/index.js'

import {
    compareChart
} from './compare/index.js'

import {
    monthChart
} from './month/index.js'

const charts = {
    overallChart,
    compareChart,
    monthChart,

    async build() {
        const charts = Object.values(this).filter(val => typeof val !== 'function');
        for (const chart of charts) {
            await chart.build();
        }
    },
    async clear() {
        const charts = Object.values(this).filter(val => typeof val !== 'function');
        for (const chart of charts) {
            await chart.clear();
        }
    },
    async render(props) {
        const charts = Object.values(this).filter(val => typeof val !== 'function');
        for (const chart of charts) {
            await chart.render(props);
        }
    },

}

export {
    charts
};