export const options = {
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
                position: 'top'
            }
        },
        plugins: {
            colors: {
                forceOverride: false
            }
        }
    }
};
