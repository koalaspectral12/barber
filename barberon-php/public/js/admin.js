/**
 * Barberon — Admin panel JS helpers
 */

/** Open a dialog */
function openDialog(id) {
  document.getElementById(id)?.classList.add('open');
}

/** Close a dialog */
function closeDialog(id) {
  document.getElementById(id)?.classList.remove('open');
}

// Close dialog when clicking the backdrop
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('dialog-backdrop')) {
    e.target.classList.remove('open');
  }
});
