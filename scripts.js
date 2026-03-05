// Basic interaction for the button on index.html

// Wait until the DOM is fully parsed
window.addEventListener('DOMContentLoaded', () => {
  // Grab the button by its ID
  const btn = document.getElementById('myButton');
  if (!btn) return;

  // Attach a click handler that shows a friendly message
  btn.addEventListener('click', () => {
    alert('Hello and welcome to my first website!');
  });
});
