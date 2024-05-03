const insert = {
    async script(url) {
        var resolveFunction;
        const loadPromise = new Promise(function (resolve, _) {
            resolveFunction = resolve;
        });

        var script = document.createElement('script');
        script.onload = () => {
            console.debug('script loaded', url);
            resolveFunction();
        };
        script.type = 'text/javascript';
        script.src = url;
        document.head.appendChild(script);

        return loadPromise;
    },

    async style(url) {
        var resolveFunction;
        const loadPromise = new Promise(function (resolve, _) {
            resolveFunction = resolve;
        });
        
        var link = document.createElement('link');
        link.onload = () => {
            console.debug('style loaded', url);
            resolveFunction();
        };
        link.rel = 'stylesheet';
        link.href = this.getUrl(url);
        document.head.appendChild(link);
        return loadPromise;
    },

    async html(el, url) {
        var resolveFunction;
        const loadPromise = new Promise(function (resolve, _) {
            resolveFunction = resolve;
        });

        $(el).load(this.getUrl(url), function () {
            console.debug('content loaded', url);
            resolveFunction();
        });

        return loadPromise;
    },

    getUrl(path) {
        return new URL('../' + path,
            import.meta.url).href + '?' + Date.now()
    }
}

export {
    insert
};