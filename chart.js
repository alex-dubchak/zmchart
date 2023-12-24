async function showChart(isLocal) {

    function renderOverallChart(){
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

        // console.log(options);
        const theChart = new Chart(document.getElementById("chart"), options);
        return theChart;
    }

    function renderCompareChart(){
        var options = {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Порівняння'
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: false,
                    },
                    y: {
                        stacked: false
                    },
                    y1: {
                        stacked: false
                    }
                }
            }
        };

        // console.log(options);
        const theChart = new Chart(document.getElementById("chart1"), options);
        return theChart;
    }

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

    async function getAllCategories(tagGroups){
        return Object.getOwnPropertyNames(tagGroups).reduce((acc, val ) => {
            if (!acc.hasOwnProperty(val)) {
                acc[val] = 0;
            }
            return acc;
        }, {"0" : 0});
    }

    async function calculateInitialBalance(profile){
        return Object.getOwnPropertyNames(profile.account).reduce((acc, val) => {
            let acnt = profile.account[val];
            let amount = parseFloat(acnt.balance);
            let currInstr = profile.instrument[acnt.instrument];
            if (currInstr.id != instr.id) {
                amount = amount * (currInstr.value / currInstr.multiplier) / (instr.value / instr.multiplier);
            }
            acc = +(new Number(acc + amount)).valueOf().toFixed(2);
            return acc;
        }, 0);
    }

    function convertAmount(amount, instrument, defaultInstrument, profile){
        let currInstr = profile.instrument[instrument];
        if (currInstr.id != instr.id) {
            amount = amount * (currInstr.value / currInstr.multiplier) / (defaultInstrument.value / defaultInstrument.multiplier);
        }
        return amount;
    }

    function extractData(data, instr, profile){
        return data.reduce((acc, val) => {
            if (val.direction == -1) {
                let cat = val.tag_group ?? 0;
                let sum = acc.opts.hasOwnProperty(cat) ? acc.opts[cat] : 0;
                let amount = parseFloat(val.outcome);

                amount = convertAmount(amount, val.instrument_outcome, instr, profile);

                sum = +(new Number(sum + amount)).valueOf().toFixed(2);
                acc.opts[cat] = sum;
                acc.total = +(new Number(acc.total + amount)).valueOf().toFixed(2);
            }
            if (val.direction == 1) {
                let amount = parseFloat(val.income);
                amount = convertAmount(amount, val.instrument_income, instr, profile);
                acc.income = +(new Number(acc.income + amount)).valueOf().toFixed(2);
            }
            return acc;
        }, { income: 0, opts: { }, total: 0});
    }
    
    function normalizeData(opts){
        let data =  Object.getOwnPropertyNames(opts).reduce((acc, val) => {
            let cat = profile.tag_groups.hasOwnProperty(val) ?
                profile.tags[profile.tag_groups[val].tag0].title :
                'No Category';
            acc.push({
                label: cat,
                data: opts[val],
                tag: val
            });
            return acc
        }, []);
        data.sort((a1, a2) => a2.data - a1.data);
        return data;
    }

    function getDatasetLength(dss){
        let length = 0;
        for(let ds in dss){
            if (dss[ds].data.length > length){
                length = dss[ds].data.length;
            }
        }
        return length;
    }

    function getOrCreateDs(dss, obj, idx){
        let ds = dss.find((el) => el.tag === obj.tag) ;
        if (!ds){
            ds = { 
                ...obj,
                data: new Array(idx).fill(0),
            };
            dss.push(ds);
            
        }
        return ds;
    }

    function addData(dss, data, obj, idx){
        let ds = getOrCreateDs(dss, obj, idx);

        ds.data.unshift(data);
    }

    function alignData(dss){
        let length = 0;
        for(let ds in dss){
            if (dss[ds].data.length > length){
                length = dss[ds].data.length;
            }
        }

        for(let ds in dss){
            if (dss[ds].data.length < length){
                dss[ds].data.unshift(0);
            }
        }
    }

    function displayData(chart, opts, total, income, balance, category, idx){
        const line = {
            yAxisID: 'y1',
            type: "line",
            tension: 0.4,
            cubicInterpolationMode: "monotone"
        };

        chart.data.labels.unshift(category);

        let dss = chart.data.datasets;

        addData(dss, total, {
            ...line,
            tag: 'total',
            label: 'Total'
        }, idx);

        addData(dss, income, {
            ...line,
            tag: 'income',
            label: 'Income'
        }, idx);

        addData(dss, balance, {
            ...line,
            tag: 'balance',
            label: 'Balance',
            yAxisID: 'y2',
        }, idx);

        opts.reduce((_, option) => {
            addData(dss, option.data, {
                tag: option.tag,
                label: option.label
            }, idx);

            return _;
        }, []);

        alignData(dss);

        chart.update("default");

    }

    let profile = await getProfile();
    let acct = profile.account[profile.default_account];
    let instr = profile.instrument[acct.instrument];

    console.log(acct, instr);

    const defaultOpts = await getAllCategories(profile.tag_groups);

    let balance = await calculateInitialBalance(profile);

    let now = new Date();
    let currentMonth = now.getMonth();
    let year = now.getFullYear();

    window.theChart = await renderOverallChart(); 

    for (let month in [...Array(24).keys()]) {
        
        let start = new Date(new Date(year, currentMonth - +month, 1, 10).toUTCString()).toISOString().slice(0, 10);
        let end = new Date(new Date(year, currentMonth + 1 - +month, 0, 10).toUTCString()).toISOString().slice(0, 10);

        let data = await getData(start, end);

        let { opts, income , total} = await extractData(data, instr, profile, defaultOpts); 
        opts = normalizeData(opts);

        let category = start.slice(0, 7);
        
        console.log(opts, total, income, balance, category);
        displayData(theChart, opts, total, income, balance, category, +month);

        console.log(theChart.data.datasets);
        balance = +(new Number(balance - income + total)).valueOf().toFixed(2);
    }
}


function restoreConsole() {
    // Create an iframe for start a new console session
    var iframe = document.createElement('iframe');
    // Hide iframe
    iframe.style.display = 'none';
    // Inject iframe on body document
    document.body.appendChild(iframe);
    // Reassign the global variable console with the new console session of the iframe 
    console = iframe.contentWindow.console;
    window.console = console;
    // Don't remove the iframe or console session will be closed
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

    let chart1 = document.createElement('canvas');
    chart1.id = 'chart1';
    console.log(document.getElementById("report"));
    document.getElementById("report").append(chart1);

    let btn = document.createElement('button');
    btn.onclick = function(){
        console.log(theChart);
        for (let i = 3; i < theChart.data.datasets.length; i++){
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
restoreConsole();
console.log('Loaded');

document.addEventListener('DOMContentLoaded', () => {
    RunAll(true);
}, false);