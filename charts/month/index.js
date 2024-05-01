const monthChart = {
    theChart: null,
    toDisplay: 1,

    clear: function () {
        this.theChart.data.datasets = [];
        this.theChart.data.labels = [];
    },

    render: function ({opts, total, income, balance, category, idx}) {
        if (+idx >= this.toDisplay) return;
        let ds = {
            data: new Array(this.theChart.data.labels.length).fill(0),
            label: category,
            //backgroundColor: color
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
            }
        };

        // console.log(options);
        this.theChart = new Chart(document.getElementById("chart-month"), options);
        return this.theChart;
    }
}

export {
    monthChart
};