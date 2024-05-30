import { options } from "./options.js";

const monthChart = {
    name: 'month',
    theChart: null,
    toDisplay: 0,
    done: false,

    async clear() {
        this.theChart.data.datasets = [];
        this.theChart.data.labels = [];
        this.done = false;
    },

    async render({opts, total, income, balance, category, idx}) {
        this.done = true;
        if (idx != this.toDisplay) return;
        let ds = {
            data: new Array(this.theChart.data.labels.length).fill(0),
            label: category,
            instrument: report.data.profile.currency
        };
        this.controls.update({category}, this);
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
        this.controls.build(this);
        this.theChart = new Chart(document.getElementById("chart-month"), this.options);
        return this.theChart;
    },
    controls: {
        build(chart){
            $("#month-prev").on('click', (event) => {
                chart.toDisplay++;
                report.renderAll([chart.name]);
            });
    
            $("#month-next").on('click', (event) => {
                chart.toDisplay--;
                report.renderAll([chart.name]);
            });
        },
        update({category}, chart){
            $('#month-title').text(category);
            $("#month-next").prop('disabled', !chart.toDisplay );
        }
    },

    options
}

export {
    monthChart
};