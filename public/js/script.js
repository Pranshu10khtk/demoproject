(() => {
  'use strict'

  const rating = document.querySelector('#rating')
  const ratingValue = document.querySelector('#rating-value')

  if (rating && ratingValue) {
    rating.addEventListener('input', () => {
      ratingValue.textContent = `${rating.value} / 5`
    })
  }

  const emailChoice = document.querySelector('[data-email-choice]')
  const emailForm = document.querySelector('#email-signup-form')

  if (emailChoice && emailForm) {
    emailChoice.addEventListener('click', () => {
      emailChoice.setAttribute('aria-expanded', 'true')
      emailChoice.classList.add('is-selected')
      emailForm.classList.add('is-visible')
      emailForm.querySelector('input').focus()
    })
  }

  const passwordToggle = document.querySelector('[data-password-toggle]')
  const passwordInput = document.querySelector('#login-password')

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password'
      passwordInput.type = isPassword ? 'text' : 'password'
      passwordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password')
      passwordToggle.setAttribute('title', isPassword ? 'Hide password' : 'Show password')
      passwordToggle.innerHTML = `<i class="fa-regular fa-eye${isPassword ? '-slash' : ''}" aria-hidden="true"></i>`
    })
  }

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()