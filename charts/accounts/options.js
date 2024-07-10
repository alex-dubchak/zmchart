export const options = {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            title: {
                display: true,
                text: 'Month'
            },
            legend: {
                display: false
            }
        },
        responsive: true,
        plugins: {
            colors: {
                forceOverride: false
            }
        }
    },
    plugins: [{
        id: 'doughnutLabel',
        beforeDatasetsDraw(chart, args, pluginOptions) {
            const {
                ctx,
                data
            } = chart;
            if (!data.datasets.length) return;
            ctx.save();
            const x = chart.getDatasetMeta(0).data[0].x;
            const y = chart.getDatasetMeta(0).data[0].y;
            ctx.font = 'bold 30px sans-serif';
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let idx = 0;
            let total = 0;
            for (let dataItem of data.datasets[0].data){
                if (chart.legend.legendItems[idx++].hidden) continue;
                total += dataItem;
            }

            let symbol = data.datasets[0].instrument.symbol;
            ctx.fillText(`+ ${symbol}${total.toFixed(2)}`, x, y);
        }
    }]
};