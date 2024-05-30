import {
    utils
} from "../utils/index.js";

const duration = {
    value: 0,
    build() {
        let _this = this;
        this.value = +utils.getCookie('duration') || 12;

        console.debug('building duration', this.value);
        $('#duration')
            .val(this.value)
            .on('change', (event) => _this.change(event));
    },
    change(event) {
        this.value = +event.currentTarget.value;
        utils.setCookie('duration', this.value);
        report.renderAll([report.charts.overallChart.name]);
    }
};

export {
    duration
};