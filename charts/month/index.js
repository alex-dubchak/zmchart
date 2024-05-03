import { options } from "./options.js";

const monthChart = {
    theChart: null,
    toDisplay: 0,

    async clear() {
        this.theChart.data.datasets = [];
        this.theChart.data.labels = [];
    },

    async render({opts, total, income, balance, category, idx}) {
        if (idx != this.toDisplay) return;
        let ds = {
            data: new Array(this.theChart.data.labels.length).fill(0),
            label: category,
            instrument: report.data.profile.currency
        };
        $('#month-title').text(category);
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
    async build() {
        this.buildControls();
        this.theChart = new Chart(document.getElementById("chart-month"), this.options);
        return this.theChart;
    },
    buildControls(){
        let _this = this;
        $("#month-prev").on('click', (event) => {
            _this.toDisplay++;
            report.renderAll();
        });

        $("#month-next").on('click', (event) => {
            _this.toDisplay--;
            report.renderAll();
        });
    },

    options
}

export {
    monthChart
};