let defaultFavorites = [0, 1, 2, 3, 4];

let settings = {
    MAX_FAV: 7
}

$(document).ready(() => {
    favoriteManager.init();
    gestureController.init();
    channelWorker.init($('.channels'));

    $('.player').click(() => {
        if(gestureController.finished && gestureController.current == 2) gestureController.back();
    })
});

let favoriteManager = {
    favorites: [],
    init: function () {
        let storage = localStorage.getItem('favCh');
        if (storage == null) {
            this.favorites = defaultFavorites;
            return this.update();
        }
        this.favorites = JSON.parse(storage);
        this.update();
    },
    add: function (id) {
        if (this.favorites.length == 0) return;
        if (this.favorites.length >= settings.MAX_FAV) return;
        if (this.favorites.includes(id)) return;
        this.favorites.push(id);
        this.update();
    },
    remove: function (id) {
        if (this.favorites.length == 1) return;
        this.favorites = this.favorites.filter((f) => { return f != id });
        this.update();
    },
    update: function () {
        this.updateDisplay();
        this.updateStorage();
    },
    updateDisplay: function () {
        let fav = this.favorites;
        $('ul.favorites').each(function () {
            $(this).empty();
            fav.forEach((f) => {
                let d = getChannelDetails(f)
                if (d == null) return;
                let element = createChannelHtml(d.name, d.source, d.logo, f);
                if ($(this).hasClass('change')) {
                    let clickHandler = new Hammer.Manager(element.get(0));
                    clickHandler.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
                    clickHandler.add(new Hammer.Tap({ event: 'singletap' }));
                    clickHandler.get('doubletap').recognizeWith('singletap');
                    clickHandler.get('singletap').requireFailure('doubletap');
                    clickHandler.on('singletap doubletap', function (e) {
                        switch (e.type) {
                            case "singletap":
                                gestureController.hide();
                                playerManager.changeSource(f);
                                break;
                            case "doubletap":
                                favoriteManager.remove(f);
                                break;
                        }
                    });
                } else {
                    element.click(() => {
                        gestureController.hide();
                        playerManager.changeSource(f);
                    });
                }
                $(this).append(element);
            });
        });
        $(`.channels ul.all .channel.fav`).each(function() {
            if(!fav.includes($(this).attr('data-cid'))) {
                $(this).removeClass('fav')
            }
        });
        fav.forEach((f) => {
            $(`.channels ul.all .channel[data-cid=${f}]`).addClass('fav');
        });
    },
    updateStorage: function () {
        localStorage.setItem('favCh', JSON.stringify(this.favorites));
    }
}

let gestureController = {
    lastAction: Date.now(),
    current: 2,
    finished: true,
    init: function () {
        let gest = new Hammer($('.gest').get(0));
        gest.get('pan').set({ enable: true, direction: Hammer.DIRECTION_VERTICAL, threshold: window.innerWidth * 0.005 })
        gest.on('panright panleft', (e) => {
            if ((Date.now() - this.lastAction) > 500) {
                switch (e.type) {
                    case "panright":
                        this.next();
                        break;

                    case "panleft":
                        this.back();
                        break;
                    default: break;
                }
                this.lastAction = Date.now();
            }
        });
        this.update();
    },
    next: function () {
        this.current += 1;
        if (this.current > 2) this.current = 2;
        this.update();
    },
    back: function () {
        this.hide();
    },
    hide: function () {
        this.current = 0;
        this.update();
    },
    time: null,
    update: function () {
        this.finished = false;
        switch (this.current) {
            case 0:
                $('.player').removeClass('blur')
                $('.ui').addClass('hide');
                $('.fastswitch').addClass('hide');
                break;
            case 1:
                $('.ui').addClass('hide');
                $('.player').removeClass('blur')
                $('.fastswitch').removeClass('hide');
                break;
            case 2:
                $('.player').addClass('blur')
                $('.ui').removeClass('hide');
                $('.fastswitch').addClass('hide');
                break;
            default: break;
        }
        clearTimeout(this.time)
        this.time = setTimeout(() => {
            this.finished = true;
        }, 600);
    }
}

let channelWorker = {
    el: null,
    init: function (el) {
        this.el = el;
        el.find('.close').click(() => {
            gestureController.hide();
        });
        let list = el.find('ul.all');
        list.empty();
        window.channelData.forEach((c, i) => {
            let element = createChannelHtml(c.name, c.source, c.logo, i);
            if (favoriteManager.favorites.includes(i)) element.addClass('fav');
            let clickHandler = new Hammer.Manager(element.get(0));
            clickHandler.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
            clickHandler.add(new Hammer.Tap({ event: 'singletap' }));
            clickHandler.get('doubletap').recognizeWith('singletap');
            clickHandler.get('singletap').requireFailure('doubletap');
            clickHandler.on('singletap doubletap', function (e) {
                switch (e.type) {
                    case "singletap":
                        gestureController.hide();
                        playerManager.changeSource(i);
                        break;
                    case "doubletap":
                        favoriteManager.add(i);
                        break;
                }
            });
            list.append(element);
        });
    }
}


function createChannelHtml(name, source, logo, id) {
    return $(`<li class="channel" data-cid="${id}" data-source="${source}" data-name="${name}"><img class="icon"src="${logo}"alt="${name}"><div class="description"><p>${name}</p></div></li>`);
}

function getChannelDetails(id) {
    return window.channelData?.[id];
}