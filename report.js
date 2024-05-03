import {
    charts,
} from './charts/index.js';
import { controls } from './controls/index.js';
import {
    data
} from './data.js';
import {
    insert,
    utils
} from './utils/index.js';

const report = {
    async renderAll() {
        $('#loader-container').show();
        await charts.clear();
        let balance = await data.getInitialBalance();
        for (let month in [...Array(this.controls.duration.value).keys()]) {
            balance = await this.renderMonth(+month, balance);
        }
        $('#loader-container').hide();
    },
    async renderMonth(month, totalBalance) {
        const {
            opts,
            income,
            total,
            category,
            balance
        } = await this.data.get(month);

        await charts.render({
            opts,
            total,
            income,
            balance: totalBalance,
            category,
            idx: month
        });

        totalBalance -= balance;

        return totalBalance
    },
    async preFetchData() {
        let all = [];
        for (let month in [...Array(36).keys()]) {

            let start = new Date(new Date(year, currentMonth - +month, 1, 10).toUTCString()).toISOString().slice(0, 10);
            let end = new Date(new Date(year, currentMonth + 1 - +month, 0, 10).toUTCString()).toISOString().slice(0, 10);

            all.push(getData(start, end));
        }
        await Promise.all(all);
    },
    async buildContent() {
        utils.restoreConsole();

        console.log('building content from',
            import.meta.url);
        await insert.style('style.css');

        await insert.html('#content', 'report.html');
        await insert.script('https://cdn.jsdelivr.net/npm/chart.js');
        await insert.script('https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-annotation/3.0.1/chartjs-plugin-annotation.min.js');

        await this.controls.build();

        console.log('built');
    },

    async run() {
        await this.buildContent();

        //await preFetchData();
        await charts.build()

        await this.renderAll();
    },
    charts,
    data,
    controls
}

window.report = report;

report.run();