const api = {
    baseUrl: 'https://zenmoney.ru/api/',
    storage: {},
    getData: async function (start, end) {
        let url = this.getUrl(`v2/transaction?limit=null&type_notlike=uit&date_between%5B%5D=${start}&date_between%5B%5D=${end}`);

        if (!this.storage.hasOwnProperty(url)) {
            const response = await fetch(url);
            let res = response.ok ? await response.json() : [];
            this.storage[url] = res;
        }

        return this.storage[url];
    },
    getProfile: async function () {
        // https://zenmoney.ru/api/s1/profile/
        const response = await fetch(this.getUrl('s1/profile/'));

        return await response.json();
    },
    getUrl(path) {
        return this.baseUrl + path;
    }
}

export {
    api
};