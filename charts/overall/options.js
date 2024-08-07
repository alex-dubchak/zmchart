export const options = {
    type: 'bar',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
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
                display: false,
                min: -10000,
                max: 15000,
            },
            y2: {
                stacked: false
            }
        },
        plugins: {
            title: {
                display: false,
                text: 'Report'
            },
            colors: {
                forceOverride: true
            },
        },
    },
    plugins: [{
        opts:{
            period: 6
        },
        id: 'metadata',
        afterRender(chart, args, pluginOptions) {

            if (this.update) {
                this.update = false;
                return;
            }

            const {
                ctx,
                data
            } = chart;
            if (!data.datasets.length) return;
            let idx = 0;
            let max = 0;
            let min = 0;
            for (let label of data.labels) {
                let expense = 0;
                let income = 0;
                let dsIdx = 0;
                for (let dataset of data.datasets) {
                    if (chart.legend.legendItems[dsIdx++].hidden) continue;

                    if (dataset.tag === 'income') {
                        income = dataset.data[idx];
                    }

                    if (['y1', 'y2'].includes(dataset.yAxisID)) continue;
                    expense += dataset.data[idx];
                }

                let save = income - expense;

                max = Math.max(max, income, expense, save);
                min = Math.min(min, income, expense, save);

                data.datasets[0].data[idx] = expense;
                data.datasets[2].data[idx] = save;

                if (idx >= this.opts.period){
                    let saveSum = 0;
                    for (let i = 0; i < this.opts.period; i++){
                        saveSum += data.datasets[2].data[idx - i];
                    }
                    data.datasets[3].data[idx] = saveSum / this.opts.period;
                }
                idx++;
            }

            let scales = chart.options.scales;

            scales.y.min = scales.y1.min = min * 1.1;
            scales.y.max = scales.y1.max = max * 1.1;
            chart.update();
            this.update = true;
        }
    }]
};