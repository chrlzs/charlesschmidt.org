var App = {
  init: function () {
    const url = window.location.toString();
    if (url.includes("#")) {
      const [hash, query] = url.split("#")[1].split("?");
      const params = Object.fromEntries(new URLSearchParams(query));

      let success = params.success;
      if (success) {
        const contactForm = document.getElementById("contactForm");
        contactForm.classList.add("hidden");
        const formSubmission = document.getElementById("formSubmission");
        formSubmission.classList.remove("hidden");
        document.location.hash = "#contact";
      }
    }
  },
};

window.onload = function () {
  App.init();
};
