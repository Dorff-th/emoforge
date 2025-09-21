// src/utils/withToast.ts
import { store } from '@store/store';
import { addToast } from '@store/slices/toastSlice';

export async function withToast<T>(
  promise: Promise<T>,
  messages?: { success?: string; error?: string },
): Promise<T | null> {
  try {
    const result = await promise;
    if (messages?.success) {
      store.dispatch(addToast({ type: 'success', text: messages.success }));
    }
    return result;
  } catch (error) {
    if (messages?.error) {
      store.dispatch(addToast({ type: 'error', text: messages.error }));
    }
    return null;
  }
}
