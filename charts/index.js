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
    charts: {
        overallChart,
        compareChart,
        monthChart,
    },
    build() {
        Object.values(this.charts).forEach(chart => chart.build());
    },
    clear() {
        Object.values(this.charts).forEach(chart => chart.clear());
    },
    render(props) {
        Object.values(this.charts).forEach(chart => chart.render(props));
    }
}

export {
    charts
};