async function showChart(isLocal) {
    var result = {};
    var categories = [];


    let year = 2022;

    async function getData(start, end) {
        //https://zenmoney.ru/api/v2/transaction?limit=null&type_notlike=uit&date_between%5B%5D=2023-12-01&date_between%5B%5D=2023-12-18

        const response = await fetch(isLocal ? "data1.json" : `https://zenmoney.ru/api/v2/transaction?limit=null&type_notlike=uit&date_between%5B%5D=${start}&date_between%5B%5D=${end}`);

        return await response.json();
    }

    async function getProfile() {
        // https://zenmoney.ru/api/s1/profile/
        const response = await fetch(isLocal ? "profile1.json" : "https://zenmoney.ru/api/s1/profile/");

        return await response.json();
    }

    let profile = await getProfile();
    let acct = profile.account[profile.default_account];
    let instr = profile.instrument[acct.instrument];

    console.log(acct, instr);

    const defaultOpts = Object.getOwnPropertyNames(profile.tag_groups).reduce((acc, val ) => {
        if (!acc.hasOwnProperty(val)) {
            acc[val] = 0;
        }
        return acc;
    }, {"0" : 0});

    const initialBalance = Object.getOwnPropertyNames(profile.account).reduce((acc, val) => {
        let acnt = profile.account[val];
        let amount = parseFloat(acnt.balance);
        let currInstr = profile.instrument[acnt.instrument];
        if (currInstr.id != instr.id) {
            amount = amount * (currInstr.value / currInstr.multiplier) / (instr.value / instr.multiplier);
        }
        acc = +(new Number(acc + amount)).valueOf().toFixed(2);
        return acc;
    }, 0);

    let resultIncome = []

    for (let month in [...Array(24).keys()]) {
        let start = new Date(new Date(year, +month, 1, 10).toUTCString()).toISOString().slice(0, 10);
        let end = new Date(new Date(year, +month + 1, 0, 10).toUTCString()).toISOString().slice(0, 10);

        let data = await getData(start, end);

        let income = 0;

        let opts = data.reduce((acc, val) => {

            if (val.direction == -1) {
                let cat = val.tag_group ?? 0;
                let sum = acc.hasOwnProperty(cat) ? acc[cat] : 0;
                let amount = parseFloat(val.outcome);
                let currInstr = profile.instrument[val.instrument_outcome];
                if (currInstr.id != instr.id) {
                    amount = amount * (currInstr.value / currInstr.multiplier) / (instr.value / instr.multiplier);
                }

                sum = +(new Number(sum + amount)).valueOf().toFixed(2);
                acc[cat] = sum;
            }
            if (val.direction == 1) {
                let amount = parseFloat(val.income);
                let currInstr = profile.instrument[val.instrument_income];
                if (currInstr.id != instr.id) {
                    amount = amount * (currInstr.value / currInstr.multiplier) / (instr.value / instr.multiplier);
                }

                income = +(new Number(income + amount)).valueOf().toFixed(2);
            }
            return acc;
        }, { ...defaultOpts });

        result = Object.getOwnPropertyNames(opts).reduce((acc, val) => {

            if (!acc.hasOwnProperty(val)) {
                acc[val] = [];
            }
            acc[val].push(opts[val]);
            return acc;
        }, result);

        resultIncome.push(income);

        categories.push(start.slice(0, 7));
    }

    // remove empty categories
    result = Object.getOwnPropertyNames(result).reduce((acc, val) => {
        if (result[val].some(el=> el !== 0)){
            acc[val] = result[val];
        }
        return acc;
    }, {});

    // calculate total
    let resultTotal = Object.getOwnPropertyNames(result).reduce((acc, val) => {
        let l = result[val];
        acc = l.reduce((acc1, val1, idx)=>{
            let amount = acc1[idx] ?? 0;

            acc1[idx] = +(new Number(amount + val1)).valueOf().toFixed(2); ;
            return acc1;

        }, acc);
        return acc;
    }, []);

    let balance = [];
    // calculate balance
    resultIncome.reduceRight((acc, val, idx)=>{
        balance.unshift(acc);
        return +(new Number(acc - val + resultTotal[idx])).valueOf().toFixed(2);
    }, initialBalance);

    console.log(result, resultTotal, balance);

    // add category names
    let series = Object.getOwnPropertyNames(result).reduce((acc, val) => {
        if (result[val].some(el=> el !== 0)){
            let cat = profile.tag_groups.hasOwnProperty(val) ?
                profile.tags[profile.tag_groups[val].tag0].title :
                'No Category';

            acc.push({
                label: cat,
                data: result[val]
            });
        }
        return acc;
    }, []);

    series.push({
        label: 'Total',
        data: resultTotal,
        type: 'line',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
        yAxisID: 'y1'
    });

    series.push({
        label: 'Income',
        data: resultIncome,
        type: 'line',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
        yAxisID: 'y1'
    });
    

    series.push({
        label: 'Balance',
        data: balance,
        type: 'line',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
        yAxisID: 'y2'
    });

    var options = {
        type: 'bar',
        data: {
            labels: categories,
            datasets: series
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Капітал'
                },
                // legend: {
                //     onClick: function (e, legendItem, legend){
                //         console.log(arguments);
                //     }
                // }
            },
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true
                },
                y1: {
                    stacked: false
                },
                y2: {
                    stacked: false,
                    position: 'right'
                }
            }
        }
    };

    console.log(options);
    theChart = new Chart(document.getElementById("chart"), options);
}

function RunAll(isLocal) {
    console.log('Running');
    document.getElementsByClassName('cols1Col1')[0]?.remove();
    document.getElementsByClassName('cols1Col2')[0]?.remove();
    document.getElementsByClassName('clear')[0]?.remove();

    let chart = document.createElement('canvas');
    chart.id = 'chart';
    console.log(document.getElementById("report"));
    document.getElementById("report").append(chart);

    let btn = document.createElement('button');
    btn.onclick = function(){
        console.log(theChart);
        for (let i = 0; i < theChart.data.datasets.length - 3; i++){
            theChart.hide(i);
        }
    }
    btn.append('Hide all');
    document.getElementById("report").append(btn);

    let btn2 = document.createElement('button');
    btn2.onclick = function(){
        console.log(theChart);
        for (let i = 0; i < theChart.data.datasets.length; i++){
            theChart.show(i);
        }
    }
    btn2.append('Show all');
    document.getElementById("report").append(btn2);


    var script = document.createElement('script');
    script.onload = function () {
        showChart(isLocal);
    };
    script.type = 'text/javascript';
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);

}

console.log('Loaded');

document.addEventListener('DOMContentLoaded', () => {
    RunAll(true);
}, false);