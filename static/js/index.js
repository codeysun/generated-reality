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

  /* Video Controls */
  function setupVideoControls(videoId) {
    const video = document.getElementById(videoId);
    const playPauseBtn = document.getElementById(`${videoId}-play-pause-btn`);
    const progressContainer = document.getElementById(`${videoId}-progress-container`);
    const progressBar = document.getElementById(`${videoId}-progress-bar`);
    const timeDisplay = document.getElementById(`${videoId}-time-display`);

    if (video && playPauseBtn && progressContainer && progressBar && timeDisplay) {
      const updateTimeDisplay = () => {
        timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
      };

      if (video.readyState >= 1) { // 1 = HAVE_METADATA
        updateTimeDisplay();
      }
      video.addEventListener('loadedmetadata', updateTimeDisplay);

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
        updateTimeDisplay();
      });

      let isDragging = false;

      const startDrag = (e) => {
        isDragging = true;
        progressContainer.classList.add('dragging');
        seek(e);
      };

      const stopDrag = () => {
        if (isDragging) {
          isDragging = false;
          progressContainer.classList.remove('dragging');
        }
      };

      const doDrag = (e) => {
        if (isDragging) {
          seek(e);
        }
      };

      progressContainer.addEventListener('mousedown', startDrag);
      document.addEventListener('mousemove', doDrag);
      document.addEventListener('mouseup', stopDrag);

      function seek(e) {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const clampedPos = Math.max(0, Math.min(1, pos));
        video.currentTime = clampedPos * video.duration;
      }
    }
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  setupVideoControls('teaser');
  setupVideoControls('user-study');

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

  /* Advanced Video Comparison Logic */
  const videoState = {
    scene: '51',
    methods: {
      left: 'gt', // Always Ground Truth
      right: 'hybrid' // Default to Hybrid or whatever user wants
    }
  };

  const methodSelectors = {
    // left: document.getElementById('left-method-selector'), // Removed
    right: document.getElementById('right-method-selector')
  };

  const sceneSelector = document.getElementById('scene-selector');
  const videos = {
    left: document.getElementById('video-left'),
    right: document.getElementById('video-right')
  };
  const labels = {
    left: document.getElementById('label-left'),
    right: document.getElementById('label-right')
  };

  // Helper to get formatted filename
  function getVideoPath(method, scene) {
    return `./static/videos/hybrid/${method}-clip-0000${scene}.mp4`;
  }

  function updateVideoSources() {
    // Update Left Video (Always GT)
    const leftPath = getVideoPath(videoState.methods.left, videoState.scene);
    videos.left.src = leftPath;
    labels.left.textContent = "Ground Truth"; // Fixed label

    // Update Right Video
    const rightPath = getVideoPath(videoState.methods.right, videoState.scene);
    videos.right.src = rightPath;
    labels.right.textContent = getMethodLabel(videoState.methods.right);

    // Reload videos to apply changes
    videos.left.load();
    videos.right.load();

    // Sync videos
    videos.left.currentTime = 0;
    videos.right.currentTime = 0;
  }

  function getMethodLabel(methodKey) {
    const btn = document.querySelector(`.method-selector button[data-method="${methodKey}"]`);
    return btn ? btn.textContent : methodKey;
  }

  function updateActiveButtons() {
    // Update Method Selector (Right only)
    const buttons = methodSelectors.right.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.dataset.method === videoState.methods.right) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Scene Selector
    const sceneButtons = sceneSelector.querySelectorAll('button');
    sceneButtons.forEach(btn => {
      if (btn.dataset.scene === videoState.scene) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Initialize
  if (methodSelectors.right && sceneSelector) {
    // Event Listeners for Method Selector (Right only)
    methodSelectors.right.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const newMethod = e.target.dataset.method;
        if (newMethod !== videoState.methods.right) {
          videoState.methods.right = newMethod;
          updateVideoSources();
          updateActiveButtons();
        }
      }
    });

    // Event Listener for Scene Selector
    sceneSelector.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const newScene = e.target.dataset.scene;
        if (newScene !== videoState.scene) {
          videoState.scene = newScene;
          updateVideoSources();
          updateActiveButtons();
        }
      }
    });

    // Initial Update
    updateActiveButtons();
    updateVideoSources(); // Ensure initial state matches logic (GT left, Hybrid right)
  }

  /* Joint Video Comparison Logic */
  const jointVideoState = {
    scene: '01',
    methods: {
      left: 'gt', // Always Ground Truth
      right: 'joint' // Default to Ours
    }
  };

  const jointMethodSelectors = {
    right: document.getElementById('joint-right-method-selector')
  };

  const jointSceneSelector = document.getElementById('joint-scene-selector');
  const jointVideos = {
    left: document.getElementById('joint-video-left'),
    right: document.getElementById('joint-video-right')
  };
  const jointLabels = {
    left: document.getElementById('joint-label-left'),
    right: document.getElementById('joint-label-right')
  };

  // Helper to get formatted filename for joint videos
  function getJointVideoPath(method, scene) {
    // Scene names in joint folder are 01, 17. 
    // Files: [method]-clip-000001.mp4, [method]-clip-000017.mp4
    // We can just use the scene ID directly if it is already '01' or '17'
    const scenePadded = scene.toString().padStart(6, '0');
    return `./static/videos/joint/${method}-clip-${scenePadded}.mp4`;
  }

  function updateJointVideoSources() {
    // Update Left Video (Always GT)
    const leftPath = getJointVideoPath(jointVideoState.methods.left, jointVideoState.scene);
    jointVideos.left.src = leftPath;
    jointLabels.left.textContent = "Ground Truth";

    // Update Right Video
    const rightPath = getJointVideoPath(jointVideoState.methods.right, jointVideoState.scene);
    jointVideos.right.src = rightPath;
    jointLabels.right.textContent = getJointMethodLabel(jointVideoState.methods.right);

    // Reload videos
    jointVideos.left.load();
    jointVideos.right.load();

    // Sync
    jointVideos.left.currentTime = 0;
    jointVideos.right.currentTime = 0;
  }

  function getJointMethodLabel(methodKey) {
    const btn = document.querySelector(`#joint-right-method-selector button[data-method="${methodKey}"]`);
    return btn ? btn.textContent : methodKey;
  }

  function updateJointActiveButtons() {
    // Update Method Selector (Right only)
    const buttons = jointMethodSelectors.right.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.dataset.method === jointVideoState.methods.right) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Scene Selector
    const sceneButtons = jointSceneSelector.querySelectorAll('button');
    sceneButtons.forEach(btn => {
      if (btn.dataset.scene === jointVideoState.scene) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Initialize Joint
  if (jointMethodSelectors.right && jointSceneSelector) {
    // Method Listener
    jointMethodSelectors.right.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const newMethod = e.target.dataset.method;
        if (newMethod !== jointVideoState.methods.right) {
          jointVideoState.methods.right = newMethod;
          updateJointVideoSources();
          updateJointActiveButtons();
        }
      }
    });

    // Scene Listener
    jointSceneSelector.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const newScene = e.target.dataset.scene;
        if (newScene !== jointVideoState.scene) {
          jointVideoState.scene = newScene;
          updateJointVideoSources();
          updateJointActiveButtons();
        }
      }
    });

    updateJointActiveButtons();
    updateJointVideoSources();
  }


  /* Abstract Expansion Logic */
  const expandText = document.getElementById('abstract-expand-text');
  const extraAbstract = document.getElementById('extra-abstract');

  if (expandText && extraAbstract) {
    expandText.addEventListener('click', () => {
      extraAbstract.classList.toggle('expanded');
      expandText.classList.toggle('expanded');
    });
  }

  /* Video Overlay Toggle Logic */
  const overlayToggle = document.getElementById('overlay-toggle');

  if (overlayToggle) {
    overlayToggle.checked = false;
    overlayToggle.addEventListener('change', function () {
      const isOverlay = this.checked;
      const videos = document.querySelectorAll('.results-carousel .item video');

      videos.forEach(video => {
        const source = video.querySelector('source');
        if (!source) return;

        let src = source.getAttribute('src');
        if (isOverlay) {
          // Switch to overlay version if not already
          if (!src.includes('_overlay.mp4')) {
            src = src.replace('.mp4', '_overlay.mp4');
          }
        } else {
          // Switch back to normal version
          src = src.replace('_overlay.mp4', '.mp4');
        }

        source.setAttribute('src', src);
        video.load();
        video.play(); // Ensure it keeps playing
      });
    });
  }

})
