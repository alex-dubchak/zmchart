const overallChart = {
    theChart: null,
    min: 0,
    max: 0,
    avg: 0,
    clear: function () {
        this.theChart.data.datasets = [];
        this.theChart.data.labels = [];
        this.min = 0;
        this.max = 0;
        this.avg = 0;
    },

    render: function ({opts, total, income, balance, category, idx}) {
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

        this.min = Math.min(this.min, income - total);
        this.max = Math.max(this.max, income, total);

        this.alignData(dss);
        let scales = this.theChart.options.scales;

        scales.y.min = scales.y1.min = this.min * 1.1;
        scales.y.max = scales.y1.max = this.max * 1.1;

        const avgDuration = 6;
        const avgSave = this.theChart.options.plugins.annotation.annotations.avgSave;

        if (idx - 1 < avgDuration) {
            this.avg += (income - total);
        } else if (idx - 1 == avgDuration) {
            const val = (this.avg / (idx - 1)).toFixed(2);
            avgSave.yMin = avgSave.yMax = avgSave.label.content = val;
        }
        avgSave.xMax = this.theChart.scales.x.max;
        avgSave.xMin = this.theChart.scales.x.max - avgDuration + 1;

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

    build: function () {
        var options = {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Капітал'
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        position: 'right',
                        min: -10000,
                        max: 15000,
                    },
                    y1: {
                        stacked: false,
                        position: 'right',
                        min: -10000,
                        max: 15000,
                    },
                    y2: {
                        stacked: false
                    }
                },
                plugins: {
                    colors: {
                        forceOverride: true
                    },
                    annotation: {
                        annotations: {
                            avgSave: {
                                type: 'line',
                                xScaleID: 'x',
                                yScaleID: 'y',

                                yMin: 0,
                                yMax: 0,
                                xMin: 0,
                                xMax: 6,
                                borderColor: 'rgb(255, 99, 132)',
                                borderWidth: 2,
                                label: {
                                    display: false,
                                    content: '',
                                    backgroundColor: 'rgb(255, 99, 132)'
                                },
                                enter(ctx, event) {
                                    ctx.element.label.options.display = true;
                                    return true;
                                },
                                leave({
                                    element
                                }, event) {
                                    element.label.options.display = false;
                                    return true;
                                }
                            }
                        }
                    }
                },
                maintainAspectRatio: false,

            }
        };

        // console.log(options);
        this.theChart = new Chart(document.getElementById("chart-all"), options);
        return this.theChart;
    }
}


function hideAll(){
    for (let i = 4; i < window.overallChart.theChart.data.datasets.length; i++){
        window.overallChart.theChart.hide(i);
    }
}

function showAll(){
    for (let i = 0; i < window.overallChart.theChart.data.datasets.length; i++){
        window.overallChart.theChart.show(i);
    }
}

export {
    overallChart
}