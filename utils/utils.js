const utils = {
    restoreConsole() {
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
    },
    setCookie: (name, value, days = 365, path = '/') => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString()
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=' + path
    },
    getCookie: (name) => {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=')
            return parts[0] === name ? decodeURIComponent(parts[1]) : r
        }, '')
    },
    deleteCookie: (name, path) => {
        setCookie(name, '', -1, path)
    }
}

export {
    utils
};