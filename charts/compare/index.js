const compareChart = {
    theChart: null,
    toDisplay: 2,

    clear: function () {
        this.theChart.data.datasets = [];
        this.theChart.data.labels = [];
    },

    render: function ({opts, total, income, balance, category, idx}) {
        if (+idx >= this.toDisplay) return;

        if (+idx == 0) this.theChart.data.labels.push('Total');

        let color = idx == 0 ? "rgba(255, 99, 132, 0.5)" : "rgba(54, 162, 235, 0.5)";

        let totalDs = {
            data: [total],
            xAxisID: 'x1',
            label: category,
            backgroundColor: color
            //type: "line",
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
    build: function () {
        var options = {
            type: 'bar',
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
                        text: 'Compare'
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: false,
                    },
                    y: {
                        stacked: true
                    },
                    x1: {
                        stacked: false,
                        position: 'bottom'
                    }
                },
                plugins: {
                    colors: {
                        forceOverride: false
                    }
                }
            }
        };

        // console.log(options);
        this.theChart = new Chart(document.getElementById("chart-compare"), options);
        return this.theChart;
    }
}


export {
    compareChart
};