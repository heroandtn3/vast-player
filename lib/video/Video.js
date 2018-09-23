const media = require('./media');

function proxy(method) {
  return function callMethod() {
    var video = this.video;
    return video[method].apply(video, arguments);
  };
}

function proxyProp(property) {
  return {
    get: function get() {
      return this.video[property];
    },

    set: function set(value) {
      return (this.video[property] = value);
    }
  };
}

function Video() {
  var video = document.createElement('video');

  video.setAttribute('webkit-playsinline', true);
  video.setAttribute('playsinline', true);
  video.preload = 'auto';

  video.style.display = 'block';
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'contain';

  this.video = video;
  this.events = [];
}

Object.defineProperties(Video.prototype, {
  element: {
    get: function() {
      return this.video;
    }
  },
  duration: proxyProp('duration'),
  currentTime: proxyProp('currentTime'),
  volume: proxyProp('volume'),
  src: proxyProp('src'),
  paused: proxyProp('paused'),
  error: proxyProp('error'),
});

Video.prototype.init = function init() {
  var video = this.video;

  video.src = URL.createObjectURL(media.video);

  return video.play().then(() => {
      video.pause();
    })
    .then(() => {
      video.src = '';
      console.log('done');
    })
    .catch(err => {
      console.log('error while initializing', err);
    });
};

Video.prototype.clean = function clean() {
  this.events.forEach((event) => {
    this.video.removeEventListener(event.type, event.listener, event.options);
  });
};

Video.prototype.addEventListener = function addEventListener(type, listener, options) {
  this.events.push({
    type,
    listener,
    options
  });
  return video.addEventListener(type, listener, options);
}

Video.prototype.removeEventListener = function removeEventListener(type, listener, options) {
  // TODO: remove from this.events to avoid memory leak
  return video.removeEventListener(type, listener, options);
}

Video.prototype.play = proxy('play');

Video.prototype.pause = proxy('pause');

module.exports = Video;
