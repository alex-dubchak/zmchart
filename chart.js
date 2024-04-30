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

    function extractData(data){
        return data.reduce((acc, val) => {
            if (val.direction == -1) {
                let cat = val.tag_group ?? 0;
                let sum = acc.opts.hasOwnProperty(cat) ? acc.opts[cat] : 0;
                let amount = parseFloat(val.outcome);

                amount = convertAmount(amount, val.instrument_outcome);

                sum = +(new Number(sum + amount)).valueOf().toFixed(2);
                acc.opts[cat] = sum;
                acc.total = +(new Number(acc.total + amount)).valueOf().toFixed(2);
            }
            if (val.direction == 1) {
                let amount = parseFloat(val.income);
                amount = convertAmount(amount, val.instrument_income);
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

            let color = idx == 0? "rgba(255, 99, 132, 0.5)": "rgba(54, 162, 235, 0.5)";

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

    window.monthChart = {
        theChart: null,
        toDisplay: 1,

        clear: function(){
            this.theChart.data.datasets = [];
            this.theChart.data.labels = [];
        },

        displayData: function(opts, total, income, balance, category, idx){
            if (+idx >= this.toDisplay) return;
            let ds = {
                data: new Array(this.theChart.data.labels.length).fill(0),
                label: category,
                //backgroundColor: color
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

    window.overallChart = {
        theChart: null,
        min: 0,
        max: 0,
        avg: 0,
        clear: function(){
            this.theChart.data.datasets = [];
            this.theChart.data.labels = [];
            this.min = 0;
            this.max = 0;
            this.avg = 0;
        },

        displayData: function ( opts, total, income, balance, category, idx){
            const line = {
                yAxisID: 'y',
                type: "line",
                tension: 0.4,
                cubicInterpolationMode: "monotone"
            };
            
            let _this = this;
    
            this.theChart.data.labels.unshift(category);
    
            let dss = this.theChart.data.datasets;
    
            this.addData(dss, total, {
                ...line,
                tag: 'expense',
                label: 'Expense',
                yAxisID: 'y1',
            }, idx);
    
            this.addData(dss, income, {
                ...line,
                tag: 'income',
                label: 'Income',
                yAxisID: 'y1',
            }, idx);
    
            this.addData(dss, income - total, {
                ...line,
                tag: 'save',
                label: 'Save',
                yAxisID: 'y1',
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
            
            this.min = Math.min(this.min, income - total);
            this.max = Math.max(this.max, income, total);

            this.alignData(dss);
            let scales = this.theChart.options.scales;
            
            scales.y.min = scales.y1.min = this.min * 1.1;
            scales.y.max = scales.y1.max = this.max * 1.1;

            const avgDuration = 6;
            const avgSave = this.theChart.options.plugins.annotation.annotations.avgSave;

            if (idx < avgDuration){
                this.avg += (income - total);
            }else if (idx = avgDuration){
                const val = (this.avg / (idx)).toFixed(2);
                avgSave.yMin = avgSave.yMax = avgSave.label.content = val;
            }
            avgSave.xMax = this.theChart.scales.x.max + 1;
            avgSave.xMin = this.theChart.scales.x.max - avgDuration + 2;

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
                            position: 'right',
                            min: -10000,
                            max: 15000,
                        },
                        y1: {
                            stacked: false,
                            position: 'right',
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
                                  leave({element}, event) {
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
        monthChart.clear();

        let balance = await calculateInitialBalance(profile);
    
        for (let month in [...Array(36).keys()]) {
            balance = await renderMonth(month, balance);
        }
    }

    async function renderMonth(month, balance){
        let start = new Date(new Date(year, currentMonth - +month, 1, 10).toUTCString()).toISOString().slice(0, 10);
        let end = new Date(new Date(year, currentMonth + 1 - +month, 0, 10).toUTCString()).toISOString().slice(0, 10);

        let data = await api.getData(start, end);

        let { opts, income , total} = await extractData(data); 
        opts = normalizeData(opts);

        let category = start.slice(0, 7);
        
        //console.log(opts, total, income, balance, category);
        overallChart.displayData(opts, total, income, balance, category, +month);

        compareChart.displayData(opts, total, income, balance, category, +month);

        monthChart.displayData(opts, total, income, balance, category, +month);
        balance = +(new Number(balance - income + total)).valueOf().toFixed(2);

        return balance
    }

    async function preFetchData(){
        let all = [];
        for (let month in [...Array(36).keys()]) {
            
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
    monthChart.render();

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
    for (let i = 4; i < window.overallChart.theChart.data.datasets.length; i++){
        window.overallChart.theChart.hide(i);
    }
}

function showAll(){
    for (let i = 0; i < window.overallChart.theChart.data.datasets.length; i++){
        window.overallChart.theChart.show(i);
    }
}

function RunAll(isLocal) {
    console.log('Running');
    var css = [];
    css.push('.row {display: flex;flex-direction: row;flex-wrap: wrap;width: 100%;}');
    css.push('.column {display: flex;flex-direction: column;flex-basis: 100%;flex: 1;}');
    $("head").append('<style type="text/css">' + css.join('\n') + '</style>');

    $('.cols1Col1, .cols1Col2, .clear').remove();

    let container = $("#report");
    
    $('<div>', {id:'controls-container'})
    .append($('<select>', {id:'current-account'}))
    .appendTo(container);

    $('<div>', {class:'row'})
    .append($('<div>', {class:'column'}).append(
        $('<div>', {id:'container-month', style: 'position: relative; height: 500px'})
        .append($('<canvas>', {id:'chart-month'}))
    ))
    .append($('<div>', {class:'column'}).append(
        $('<div>', {id:'container-compare', style: 'position: relative; height: 100%'})
        .append($('<canvas>', {id:'chart-compare'}))
    ))
    .appendTo(container);

    $('<div>', {class:'row'}).append($("<h2>").append("Капітал")).appendTo(container);

    $('<div>', {class:'row'}).append(
        $('<button>').click(hideAll).append('Hide all')
    ).append(
        $('<button>').click(showAll).append('Show all')
    )
    .appendTo(container);

    $('<div>', {id:'container-all', style: 'position: relative; height: 1000px'})
    .append($('<canvas>', {id:'chart-all'}))
    .appendTo(container);


    addJsScript('https://cdn.jsdelivr.net/npm/chart.js', function(){
        addJsScript('https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-annotation/3.0.1/chartjs-plugin-annotation.min.js', function(){
            showChart(isLocal);
        })
    })
}

function addJsScript(path, onLoad){
    var script = document.createElement('script');
    script.onload = onLoad;
    script.type = 'text/javascript';
    script.src = path;
    document.head.appendChild(script);
}

restoreConsole();
console.log('Loaded');

document.addEventListener('DOMContentLoaded', () => {
    RunAll(true);
}, false);