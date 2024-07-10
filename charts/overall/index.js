import {
    options
} from "./options.js";

import {
    utils
} from "../../utils/index.js";

const overallChart = {
    name: 'all',
    options,
    theChart: null,
    min: 0,
    max: 0,
    avg: 0,
    done: false,
    toDisplay: 12,
    async build() {
        this.controls.build(this);
        this.theChart = new Chart(document.getElementById("chart-all"), this.options);
        return this.theChart;
    },
    async clear() {
        this.theChart.data.datasets = [];
        this.theChart.data.labels = [];
        this.min = 0;
        this.max = 0;
        this.avg = 0;
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
        if (idx > this.toDisplay) {
            this.done = true;
            return;
        }
        const line = {
            yAxisID: 'y',
            type: "line",
            tension: 0.4,
            cubicInterpolationMode: "monotone"
        };

        let _this = this;

        this.theChart.data.labels.unshift(category);

        let dss = this.theChart.data.datasets;

        this.addData(dss, total, {
            ...line,
            tag: 'expense',
            label: 'Expense',
            yAxisID: 'y1',
        }, idx);

        this.addData(dss, income, {
            ...line,
            tag: 'income',
            label: 'Income',
            yAxisID: 'y1',
        }, idx);

        this.addData(dss, income - total, {
            ...line,
            tag: 'save',
            label: 'Save',
            yAxisID: 'y1',
        }, idx);

        this.addData(dss, 0, {
            ...line,
            tag: 'avg-save',
            label: 'Avg Save',
            yAxisID: 'y1',
        }, idx);

        this.addData(dss, balance, {
            ...line,
            tag: 'balance',
            label: 'Balance',
            yAxisID: 'y2',
        }, idx);

        opts.reduce((_, option) => {
            _this.addData(dss, option.data, {
                tag: option.tag,
                label: option.label
            }, idx);

            return _;
        }, []);

        this.alignData(dss);

        this.theChart.update("default");
    },

    alignData: function (dss) {
        let length = 0;
        for (let ds in dss) {
            if (dss[ds].data.length > length) {
                length = dss[ds].data.length;
            }
        }

        for (let ds in dss) {
            if (dss[ds].data.length < length) {
                dss[ds].data.unshift(0);
            }
        }
    },
    getOrCreateDs: function (dss, obj, idx) {
        let ds = dss.find((el) => el.tag === obj.tag);
        if (!ds) {
            ds = {
                ...obj,
                data: new Array(idx).fill(0),
            };
            dss.push(ds);

        }
        return ds;
    },

    addData: function (dss, data, obj, idx) {
        let ds = this.getOrCreateDs(dss, obj, idx);

        ds.data.unshift(data);
    },
    update({
        dataLength
    }) {
        this.controls.update(dataLength);
    },
    controls: {
        build(chart) {
            $('#all-show').on('click', (event) => {
                for (let i = 4; i < chart.theChart.data.datasets.length; i++) {
                    chart.theChart.show(i);
                }
            });
            $('#all-hide').on('click', (event) => {
                for (let i = 4; i < chart.theChart.data.datasets.length; i++) {
                    chart.theChart.hide(i);
                }
            })
            chart.toDisplay = +utils.getCookie('duration') || 12;

            console.debug('building duration', chart.toDisplay);
            $('#all-duration')
                .val(chart.toDisplay)
                .on('change', (event) => {
                    chart.toDisplay = +event.currentTarget.value;
                    utils.setCookie('duration', chart.toDisplay);
                    report.renderAll([chart.name]);
                });
        },
        update(dataLength) {
            $('#all-duration').attr({
                max: dataLength
            });
        }
    }
}

export {
    overallChart
}