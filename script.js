window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.style.display = "none";
    document.getElementById("main-content").style.display = "block";
  }, 10000);
});
