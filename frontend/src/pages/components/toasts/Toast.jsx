/*
export const toast = (() => {
  const container = document.getElementById('toast-container');

  function createToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      container.removeChild(toast);
    });

    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 10000);

    container.appendChild(toast);
  }

  return {
    success: (msg) => createToast(msg, 'success'),
    error: (msg) => createToast(msg, 'error'),
    info: (msg) => createToast(msg, 'info'),
  };
})();
*/