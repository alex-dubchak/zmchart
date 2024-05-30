import {
    api
} from './api/index.js';
import {
    utils
} from './utils/utils.js';

export const data = {
    now: new Date(),
    data: {},
    profile: null,
    async get(idx) {
        const {
            start,
            end
        } = this.getPeriod(idx);

        const rawData = this.data[idx] || await api.getData(start, end);
        this.data[idx] = rawData;

        const data = await this.extractData(rawData);

        const result = {
            ...data,
            balance: data.income - data.total,
            category: start.slice(0, 7)
        };

        return result;
    },
    async getProfile() {
        if (this.profile) return this.profile;
        const profile = await api.getProfile();
        const defaultAccountId = utils.getCookie('default_account') || profile.default_account;
        const currentAccount = profile.account[defaultAccountId];
        const currency = profile.instrument[currentAccount.instrument];
        this.profile = {
            ...profile,
            currentAccount,
            currency,
            defaultAccountId
        };

        return this.profile;
    },

    async getInitialBalance() {
        const profile = await this.getProfile();
        const _this = this;

        let acc = 0;
        for (let val of Object.getOwnPropertyNames(profile.account)) {
            let account = profile.account[val];
            let amount = parseFloat(account.balance);
            amount = await _this.convertAmount(amount, account.instrument);
            acc = acc + amount;
        }
        return +acc.toFixed(2);
    },

    changeAccount(account) {
        this.profile.currentAccount = this.profile.account[account];
        this.profile.currency = this.profile.instrument[this.profile.currentAccount.instrument];
        utils.setCookie('default_account', account);
        console.log('account changed to', account);
    },

    async extractData(data) {

        let income = 0;
        let opts = {};
        let total = 0;
        for (let val of data || []) {
            if (val.direction == -1) {
                let cat = val.tag_group || 0;
                let sum = opts.hasOwnProperty(cat) ? opts[cat] : 0;
                let amount = parseFloat(val.outcome);

                amount = await this.convertAmount(amount, val.instrument_outcome);

                sum += amount;
                opts[cat] = sum;
                total += amount;
            }
            if (val.direction == 1) {
                let amount = parseFloat(val.income);
                amount = await this.convertAmount(amount, val.instrument_income);
                income += amount;
            }
        }

        return {
            income,
            total,
            opts: await this.normalizeData(opts)
        };
    },
    async convertAmount(amount, fromInstrumentId) {
        const {
            instrument,
            currentAccount
        } = await this.getProfile();
        let fromInstrument = instrument[fromInstrumentId];
        let toInstrument = instrument[currentAccount.instrument];
        if (fromInstrument.id != toInstrument.id) {
            amount = amount * (fromInstrument.value / fromInstrument.multiplier) / (toInstrument.value / toInstrument.multiplier);
        }
        return +amount.toFixed(2);
    },

    async normalizeData(opts) {
        const profile = await this.getProfile();
        let data = Object.getOwnPropertyNames(opts).reduce((acc, val) => {
            let cat = profile.tag_groups.hasOwnProperty(val) ?
                profile.tags[profile.tag_groups[val].tag0].title :
                'No Category';
            acc.push({
                label: cat,
                data: opts[val],
                tag: val
            });
            return acc;
        }, []);
        data.sort((a1, a2) => a2.data - a1.data);
        return data;
    },

    getPeriod(idx) {
        const month = this.now.getMonth();
        const year = this.now.getFullYear();

        let start = new Date(new Date(year, month - idx, 1, 10).toUTCString()).toISOString().slice(0, 10);
        let end = new Date(new Date(year, month + 1 - idx, 0, 10).toUTCString()).toISOString().slice(0, 10);

        return {
            start,
            end
        };
    }
};