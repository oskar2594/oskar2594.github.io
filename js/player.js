$(document).ready(() => {
    const player = $('#player').get(0);
    const playpause = $('.player .controls .playpause').get(0);

    valueEvent.on('#player', 'data-source', (val) => {
        playerManager.update(val, player)
    });
    $('.player .controls .playpause').click(() => {
        playerManager.playpause();
    });
    $('.player .content').click((e) => {
        if (!playpause !== e.target && !playpause.contains(e.target)) {
            playerManager.changeControls(!playerManager.showControls);
        }
    });
});

let playerManager = {
    el: null,
    source: null,
    hls: null,
    showControls: false,
    isClicked: false,
    init: function (el, source) {
        this.el = el;
        this.source = source;
        if (Hls.isSupported()) {
            this.hls = new Hls();
            this.hls.loadSource(source);
            this.hls.attachMedia(el)
            this.hls.subtitleTrack = 0;
            this.hls.subtitleDisplay = false;
            this.changeControls(false);
            this.hls.on(Hls.Events.MANIFEST_PARSED, function () {
                el.play();
            });
        }
    },
    update: function (source, el) {
        if (this.el == null) {
            return this.init(el, source);
        }
        this.source = source;
        this.hls.destroy();
        this.init(this.el, source);
    },
    changeSource: function(id) {
        this.update(window.channelData[id]?.source);
    },
    playpause: function () {
        if (this.el == null) return;
        if (!this.el.paused) {
            this.el.pause();
            $('.player .controls .playpause').addClass('play').removeClass('pause');
        } else {
            $('.player .controls .playpause').addClass('pause').removeClass('play');
            this.el.currentTime = this.el.duration - 10;
            if (this.el.currentTime - this.el.duration > 0) this.el.currentTime = this.el.duration;
            this.el.play();
        }
        clearInterval(this.dInterval);
        this.dInterval = setTimeout(() => {
            this.changeControls(false)
        }, 1000);
    },
    changeControls: function (show) {
        this.showControls = show;
        if (show) {
            $('.player .controls').show();
            $('.player .controls').css('opacity', 1);
            clearInterval(this.dInterval);
            this.dInterval = setTimeout(() => {
                this.changeControls(false);
            }, 3000);
        } else {
            this.isClicked = true;
            $('.player .controls').css('opacity', 0);
            setTimeout(() => {
                $('.player .controls').hide();
            }, 500);
        }
    },
    dInterval: null
}
