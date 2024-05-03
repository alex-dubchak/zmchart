export const options = {
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
                display: false,
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
