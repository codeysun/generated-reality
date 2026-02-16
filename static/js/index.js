window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function () { return false; };
  image.oncontextmenu = function () { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function () {
  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function () {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");

  });

  var options = {
    slidesToScroll: 1,
    slidesToShow: 3,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
    pagination: false,
  }

  // Initialize all div with carousel class
  var carousels = bulmaCarousel.attach('.carousel', options);

  // Loop on each carousel initialized
  for (var i = 0; i < carousels.length; i++) {
    // Add listener to  event
    carousels[i].on('before:show', state => {
      console.log(state);
    });
  }

  // Access to bulmaCarousel instance of an element
  var element = document.querySelector('#my-element');
  if (element && element.bulmaCarousel) {
    // bulmaCarousel instance is available as element.bulmaCarousel
    element.bulmaCarousel.on('before-show', function (state) {
      console.log(state);
    });
  }

  /*var player = document.getElementById('interpolation-video');
  player.addEventListener('loadedmetadata', function() {
    $('#interpolation-slider').on('input', function(event) {
      console.log(this.value, player.duration);
      player.currentTime = player.duration / 100 * this.value;
    })
  }, false);*/
  preloadInterpolationImages();

  $('#interpolation-slider').on('input', function (event) {
    setInterpolationImage(this.value);
  });
  setInterpolationImage(0);
  $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

  bulmaSlider.attach();

  /* Teaser Video Controls */
  const video = document.getElementById('teaser');
  const playPauseBtn = document.getElementById('teaser-play-pause-btn');
  const progressContainer = document.getElementById('teaser-progress-container');
  const progressBar = document.getElementById('teaser-progress-bar');
  const timeDisplay = document.getElementById('teaser-time-display');

  if (video && playPauseBtn && progressContainer && progressBar && timeDisplay) {
    if (video.readyState >= 1) { // 1 = HAVE_METADATA
      timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
    }
    video.addEventListener('loadedmetadata', () => {
      timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
    });

    playPauseBtn.addEventListener('click', () => {
      if (video.paused || video.ended) {
        video.play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });

    video.addEventListener('pause', () => {
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    video.addEventListener('timeupdate', () => {
      const percentage = (video.currentTime / video.duration) * 100;
      progressBar.style.width = percentage + '%';
      timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
    });

    let isDragging = false;

    progressContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      progressContainer.classList.add('dragging');
      seek(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        seek(e);
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        progressContainer.classList.remove('dragging');
      }
    });

    function seek(e) {
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const clampedPos = Math.max(0, Math.min(1, pos));
      video.currentTime = clampedPos * video.duration;
    }

    function formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "0:00";
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }

  /* Video Comparison Slider Logic */
  const comparisonContainers = document.querySelectorAll('.video-comparison-container');

  comparisonContainers.forEach(container => {
    const slider = container.querySelector('.comparison-slider');
    const videoLeft = container.querySelector('.video-left');

    if (!slider || !videoLeft) return;

    let isDragging = false;

    const startDrag = (e) => {
      isDragging = true;
      container.classList.add('dragging');
      // e.preventDefault(); // Prevent text selection - might interfere with touch scrolling if not careful
    };

    const stopDrag = () => {
      isDragging = false;
      container.classList.remove('dragging');
    };

    const moveSlider = (e) => {
      if (!isDragging) return;

      const rect = container.getBoundingClientRect();
      let clientX;

      if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }

      let position = (clientX - rect.left) / rect.width;

      // Clamp position between 0 and 1
      position = Math.min(Math.max(position, 0), 1);
      const percentage = position * 100;

      slider.style.left = `${percentage}%`;
      videoLeft.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    };

    slider.addEventListener('mousedown', startDrag);
    slider.addEventListener('touchstart', startDrag, { passive: true });

    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    document.addEventListener('mousemove', moveSlider);
    document.addEventListener('touchmove', moveSlider, { passive: true });
  });

})
