// Bootstrap custom validation (SAFE VERSION)

(() => {
  'use strict';

  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach((form) => {
    form.addEventListener('submit', (event) => {

      // ❗ Only stop submit if form is INVALID
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Add Bootstrap validation UI
      form.classList.add('was-validated');

    }, false);
  });
})();