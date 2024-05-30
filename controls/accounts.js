const accounts = {
    async build() {
        let {
            currentAccount,
            account
        } = await report.data.getProfile();

        $.each(account, function (idx, el) {
            let selected = el.id == currentAccount.id ? {
                selected: 'selected'
            } : {};
            $("#current-account").append(
                $('<option>', {
                    value: el.id,
                    text: el.title,
                    ...selected
                })
            );
        });
        const _this = this;
        $("#current-account").change((event) => _this.changeAccount(event));
    },
    changeAccount(event) {
        report.data.changeAccount(event.target.value);
        report.renderAll();
    },
};

export {
    accounts
};