import {
    overallChart
} from './overall/index.js'

import {
    compareChart
} from './compare/index.js'

import {
    monthChart
} from './month/index.js'


import {
    yearChart
} from './year/index.js'

const charts = {
    overallChart,
    compareChart,
    monthChart,
    yearChart,

    async build() {
        const charts = this.getCharts();
        for (const chart of charts) {
            await chart.build();
        }
    },
    async clear(only = []) {
        const charts = this.getCharts(only);
        for (const chart of charts) {
            await chart.clear();
        }
    },
    async render(props, only = []) {
        const charts = this.getCharts(only);
        for (const chart of charts) {
            await chart.render(props);
        }
    },

    getCharts(only = []) {
        return Object.values(this)
            .filter(val => 
                typeof val !== 'function'
                && (
                    !only.length 
                    || only.includes(val.theChart.canvas.id.split('-').pop())
                    )
            )
    },
    update(options){
        const charts = this.getCharts();
        for (const chart of charts) {
            chart.update && chart.update(options);
        }
    },
    done(){
        const charts = this.getCharts();
        let done = true; 
        for (const chart of charts) {
            done &= chart.done;
        }
        console.debug(done);
        return done;
    }

}

export {
    charts
};