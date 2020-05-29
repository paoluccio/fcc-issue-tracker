function fadeIn(element) {
  element.style.display = 'block';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.classList.add('visible');
    });
  });
}

function fadeOut(element, callback) {
  element.classList.remove('visible');
  setTimeout(() => {
    element.style.display = 'none';
    if (callback) callback();
  }, 100);
}

function toggle(element) {
  if (element.classList.contains('visible')) {
    fadeOut(element);
  } else {
    fadeIn(element);
  }
}