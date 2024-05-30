import {
    options
} from "./options.js";

const compareChart = {
    options,
    name: 'compare',
    theChart: null,
    toDisplay: [0, 1],
    done: false,

    async build() {
        this.controls.build(this);
        this.theChart = new Chart(document.getElementById("chart-compare"), this.options);
        return this.theChart;
    },

    async clear() {
        this.theChart.data.datasets = [];
        this.theChart.data.labels = [];
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
        this.done = true;
        if (idx == 0) this.theChart.data.labels.push('Total');
        if (!this.toDisplay.includes(idx)) return;

        this.controls.update({
            categoryThis: this.toDisplay[0] == idx? category: null,
            categoryOther: this.toDisplay[1] == idx? category: null,
        }, this);

        let color = idx == this.toDisplay[0] ? "rgba(255, 99, 132, 0.5)" : "rgba(54, 162, 235, 0.5)";

        let totalDs = {
            data: [total],
            xAxisID: 'x1',
            label: category,
            backgroundColor: color
        };

        this.theChart.data.datasets.push(totalDs);

        let ds = {
            data: new Array(this.theChart.data.labels.length).fill(0),
            label: category,
            backgroundColor: color
        };

        opts.map(({
            label,
            data,
            tag
        }) => {
            let i = this.theChart.data.labels.indexOf(label);

            if (i < 0) {
                this.theChart.data.labels.push(label);
                ds.data.push(data);
            } else {
                ds.data[i] = data
            }
            return data;
        });

        this.theChart.data.datasets.push(ds);

        this.theChart.update("default");
    },
    controls: {
        build(chart) {
            $("#compare-this-prev").on('click', (event) => {
                chart.toDisplay[0]++;
                report.renderAll([chart.name]);
            });

            $("#compare-this-next").on('click', (event) => {
                chart.toDisplay[0]--;
                report.renderAll([chart.name]);
            });

            $("#compare-other-prev").on('click', (event) => {
                chart.toDisplay[1]++;
                report.renderAll([chart.name]);
            });

            $("#compare-other-next").on('click', (event) => {
                chart.toDisplay[1]--;
                report.renderAll([chart.name]);
            });
        },
        update({
            categoryThis,
            categoryOther
        }, chart) {
            if (categoryThis)
                $('#compare-this-title').text(categoryThis);
            $("#compare-this-next").prop('disabled', !chart.toDisplay[0]);

            if (categoryOther)
                $('#compare-other-title').text(categoryOther);
            $("#compare-other-next").prop('disabled', !chart.toDisplay[1]);
        }
    },
}

export {
    compareChart
};