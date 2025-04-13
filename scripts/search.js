// search.js

(function () {
    function getSearchKeyword() {
      const params = new URLSearchParams(window.location.search);
      return params.get("search");
    }
  
    function searchAndHighlight(keyword) {
      if (!keyword) return;
  
      keyword = keyword.toLowerCase();
      const elements = document.querySelectorAll("body *");
  
      let found = false;
      elements.forEach((el) => {
        if (el.children.length === 0 && el.textContent.toLowerCase().includes(keyword)) {
          el.style.backgroundColor = "yellow";
          if (!found) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            found = true;
          }
        }
      });
    }
  
    window.addEventListener("DOMContentLoaded", () => {
      const keyword = getSearchKeyword();
      searchAndHighlight(keyword);
    });
  })();
  