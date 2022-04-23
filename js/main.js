let valueEvent = {
    on: (el, vname, res) => {
        let e = $(el);
        let v = e.attr(vname);
        res(v);
        let i = setInterval(() => {
            let vv = e.attr(vname);
            if (vv != v) {
                res(vv);
                v = vv;
            }
        }, 10);
        function end() {
            clearInterval(i);
            i = null;
        }
    }
}
