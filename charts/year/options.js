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

            var labelIncome = data.datasets[0].data.reduce((a, c, i) => c + a, 0).toFixed(2);
            var labelExpense = data.datasets[0].data.reduce((a, c, i) => (chart.legend.legendItems[i].hidden || chart.legend.legendItems[i].text == 'Save' ? 0 : c) + a, 0).toFixed(2);
            let symbol = data.datasets[0].instrument.symbol;
            ctx.fillText(`+ ${symbol}${labelIncome}`, x, y - 20);
            ctx.fillText(`- ${symbol}${labelExpense}`, x, y + 20);
        }
    }]
};