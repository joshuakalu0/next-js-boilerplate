// script.js
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
  }, 10000); // 10 seconds
});
