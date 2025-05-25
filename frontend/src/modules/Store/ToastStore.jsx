import { signal } from '@preact/signals-react';

export const toasts = signal([]);

let idCounter = 0;

export const toast = {
  success: (message) => addToast('success', message),
  error: (message) => addToast('error', message),
};

function addToast(type, message) {
  const id = idCounter++;
  toasts.value = [...toasts.value, { id, type, message }];

  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 10000);
}

export function removeToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id);
}
