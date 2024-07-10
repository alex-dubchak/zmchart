import {
    options
} from "./options.js";

const accountsChart = {
    name: 'accounts',
    theChart: null,
    toDisplay: 0,
    done: false,
    income: 0,

    async clear() {
        this.theChart.data.datasets = [];
        this.theChart.data.labels = [];
        this.done = false;
    },

    async render({
        accounts
    }) {
        if (this.theChart.data.datasets.length) return;

        accounts.sort((a,b) => b.amount - a.amount);

        const categories = Object.entries(accounts).map((val) => val[1].title);
        const data = Object.entries(accounts).map((val) => val[1].amount);

        let ds = {
            data,
            instrument: report.data.profile.currency
        };

        this.theChart.data.labels =  categories,
        this.theChart.data.datasets = [ds];

        this.theChart.update("default");
        Object.entries(accounts).map((val, idx) => {
            if (val[1].type == 'debt'){
                this.theChart.toggleDataVisibility(idx);
            }
        });
        this.theChart.update("default");
        this.done = true;
    },
    async build() {
        this.theChart = new Chart(document.getElementById(`chart-${this.name}`), this.options);
        return this.theChart;
    },

    options
}

export {
    accountsChart
};