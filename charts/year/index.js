import {
    options
} from "./options.js";

const yearChart = {
    name: 'year',
    theChart: null,
    toDisplay: 0,
    done: false,
    data: {},
    income: 0,

    async clear() {
        this.theChart.data.datasets = [];
        this.theChart.data.labels = [];
        this.data = {};
        this.done = false;
    },

    async render({
        opts,
        total,
        income,
        balance,
        category,
        idx
    }) {
        console.debug({
            opts,
            total,
            income,
            balance,
            category,
            idx
        });

        var currentYear = new Date().getFullYear() + this.toDisplay;
        const [year, month] = category.split('-');

        if (currentYear > year) this.done = true;
        if (currentYear != year) return;

        opts.map(({
            label,
            data,
            tag
        }) => {
            let item = this.data[label] || 0;
            this.data[label] = item + data;
            return data;
        });
        const save = this.data['Save'] || 0; 
        this.data['Save'] = save + (income - total)
        this.income += income;

        const entries = Object.entries(this.data).sort((a, b) => a[0] == 'Save'? 1: b[1] - a[1]);
        console.log(entries);


        let ds = {
            data: entries.map((val) => val[1]),
            
            instrument: report.data.profile.currency
        };

        this.controls.update({
            category: currentYear
        }, this);

        this.theChart.data.labels =  entries.map((val) => val[0]),
        this.theChart.data.datasets = [ds];

        this.theChart.update("default");
    },
    async build() {
        this.controls.build(this);
        this.theChart = new Chart(document.getElementById("chart-year"), this.options);
        return this.theChart;
    },
    controls: {
        build(chart) {
            $("#year-prev").on('click', (event) => {
                chart.toDisplay--;
                report.renderAll([chart.name]);
            });

            $("#year-next").on('click', (event) => {
                chart.toDisplay++;
                report.renderAll([chart.name]);
            });
        },
        update({
            category
        }, chart) {
            $('#year-title').text(category);
            $("#year-next").prop('disabled', !chart.toDisplay);
        }
    },

    options
}

export {
    yearChart
};