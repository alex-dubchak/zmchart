async function showChart(isLocal) {

    const api = {
        storage: {},
        getData: async function (start, end) {
            //https://zenmoney.ru/api/v2/transaction?limit=null&type_notlike=uit&date_between%5B%5D=2023-12-01&date_between%5B%5D=2023-12-18
            let url = isLocal ? "data1.json" : `https://zenmoney.ru/api/v2/transaction?limit=null&type_notlike=uit&date_between%5B%5D=${start}&date_between%5B%5D=${end}`;
            if (!this.storage.hasOwnProperty(url)){
                const response = await fetch(isLocal ? "data1.json" : `https://zenmoney.ru/api/v2/transaction?limit=null&type_notlike=uit&date_between%5B%5D=${start}&date_between%5B%5D=${end}`);
    
                let res = await response.json();
                this.storage[url] = res;
            }
    
            return this.storage[url];
        },
        getProfile: async function () {
            // https://zenmoney.ru/api/s1/profile/
            const response = await fetch(isLocal ? "profile1.json" : "https://zenmoney.ru/api/s1/profile/");
    
            return await response.json();
        }
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

            amount = convertAmount(amount, acnt.instrument)
            acc = +(new Number(acc + amount)).valueOf().toFixed(2);
            return acc;
        }, 0);
    }

    function convertAmount(amount, instrument){
        let currInstr = profile.instrument[instrument];
        if (currInstr.id != instr.id) {
            amount = amount * (currInstr.value / currInstr.multiplier) / (instr.value / instr.multiplier);
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

    window.compareChart = {
        theChart: null,
        toDisplay: 2,

        clear: function(){
            this.theChart.data.datasets = [];
            this.theChart.data.labels = [];
        },

        displayData: function(opts, total, income, balance, category, idx){
            if (+idx >= this.toDisplay) return;

            if (+idx == 0) this.theChart.data.labels.push('Total');

            let color = idx == 0? "rgba(54, 162, 235, 0.5)": "rgba(255, 99, 132, 0.5)";

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

            opts.map(({label, data, tag})=> {
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
        render: function(){
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

    window.overallChart = {
        theChart: null,
        clear: function(){
            this.theChart.data.datasets = [];
            this.theChart.data.labels = [];
        },

        displayData: function ( opts, total, income, balance, category, idx){
            const line = {
                yAxisID: 'y1',
                type: "line",
                tension: 0.4,
                cubicInterpolationMode: "monotone"
            };

            let _this = this;
    
            this.theChart.data.labels.unshift(category);
    
            let dss = this.theChart.data.datasets;
    
            this.addData(dss, total, {
                ...line,
                tag: 'total',
                label: 'Total'
            }, idx);
    
            this.addData(dss, income, {
                ...line,
                tag: 'income',
                label: 'Income'
            }, idx);
    
            this.addData(dss, income - total, {
                ...line,
                tag: 'save',
                label: 'Save',
                yAxisID: 'y2',
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
    
            this.alignData(dss);
    
            this.theChart.update("default");
        },
        alignData: function (dss){
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
        },
        getOrCreateDs: function (dss, obj, idx){
            let ds = dss.find((el) => el.tag === obj.tag) ;
            if (!ds){
                ds = { 
                    ...obj,
                    data: new Array(idx).fill(0),
                };
                dss.push(ds);
                
            }
            return ds;
        },
    
        addData: function (dss, data, obj, idx){
            let ds = this.getOrCreateDs(dss, obj, idx);
    
            ds.data.unshift(data);
        },

        render: function (){
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
                            position: 'right'
                        },
                        y1: {
                            stacked: false,
                            position: 'right'
                        },
                        y2: {
                            stacked: false
                        }
                    },
                    plugins: {
                        colors: {
                          forceOverride: true
                        }
                      }
                }
            };
    
            // console.log(options);
            this.theChart = new Chart(document.getElementById("chart-all"), options);
            return this.theChart;
        }
    }

    function changeAccount(event){
        acct = profile.account[event.target.value];
        instr = profile.instrument[acct.instrument];
        console.log(instr);
        renderAll();
    }

    function loadAccounts(profile){
        $.each(profile.account, function(idx, el){
            let selected = el.id == profile.default_account? {selected: 'selected'}: {};
            $("#current-account").append(
                $('<option>', {
                    value: el.id,
                    text: el.title,
                    ...selected
                })
            );
        });
        $("#current-account").change(changeAccount)
    }

    async function renderAll(){
        overallChart.clear();
        compareChart.clear();
        const defaultOpts = await getAllCategories(profile.tag_groups);

        let balance = await calculateInitialBalance(profile);
    
        for (let month in [...Array(24).keys()]) {
            
            let start = new Date(new Date(year, currentMonth - +month, 1, 10).toUTCString()).toISOString().slice(0, 10);
            let end = new Date(new Date(year, currentMonth + 1 - +month, 0, 10).toUTCString()).toISOString().slice(0, 10);
    
            let data = await api.getData(start, end);
    
            let { opts, income , total} = await extractData(data, instr, profile, defaultOpts); 
            opts = normalizeData(opts);
    
            let category = start.slice(0, 7);
            
            //console.log(opts, total, income, balance, category);
            overallChart.displayData(opts, total, income, balance, category, +month);

            compareChart.displayData(opts, total, income, balance, category, +month);
            balance = +(new Number(balance - income + total)).valueOf().toFixed(2);
        }
    }

    async function preFetchData(){
        let all = [];
        for (let month in [...Array(24).keys()]) {
            
            let start = new Date(new Date(year, currentMonth - +month, 1, 10).toUTCString()).toISOString().slice(0, 10);
            let end = new Date(new Date(year, currentMonth + 1 - +month, 0, 10).toUTCString()).toISOString().slice(0, 10);
    
            all.push(getData(start, end));
        }
        await Promise.all(all);
    }

    let now = new Date();
    let currentMonth = now.getMonth();
    let year = now.getFullYear();
    
    let profile = await api.getProfile();
    loadAccounts(profile);
    let acct = profile.account[profile.default_account];
    let instr = profile.instrument[acct.instrument];

    console.log(acct, instr);

    //await preFetchData();
    overallChart.render(); 
    compareChart.render();

    await renderAll();
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
function hideAll(){
    for (let i = 4; i < theChart.data.datasets.length; i++){
        theChart.hide(i);
    }
}

function showAll(){
    for (let i = 0; i < theChart.data.datasets.length; i++){
        theChart.show(i);
    }
}

function RunAll(isLocal) {
    console.log('Running');
    $('.cols1Col1, .cols1Col2, .clear').remove();

    let container = $("#report");
    
    $('<div>', {id:'controls-container'})
    .append($('<select>', {id:'current-account'}))
    .append($('<button>').click(hideAll).append('Hide all'))
    .append($('<button>').click(showAll).append('Show all'))
    .appendTo(container);

    $('<div>', {id:'container-compare'})
    .append($('<canvas>', {id:'chart-compare'}))
    .appendTo(container);

    $('<div>', {id:'container-all'})
    .append($('<canvas>', {id:'chart-all'}))
    .appendTo(container);

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