$(document).ready(function () {

const toggleButton = document.getElementById('toggleFullscreen');
const fullscreenIcon = document.getElementById('fullscreenIcon');

toggleButton.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      showModalAlert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
    fullscreenIcon.classList.replace('bx-fullscreen', 'bx-exit-fullscreen');
  } else {
    document.exitFullscreen();
    fullscreenIcon.classList.replace('bx-exit-fullscreen', 'bx-fullscreen');
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    fullscreenIcon.classList.replace('bx-exit-fullscreen', 'bx-fullscreen');
  }
});

});
