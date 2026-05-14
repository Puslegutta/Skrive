<script setup>
defineProps({
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Ja' },
  cancelLabel: { type: String, default: 'Avbryt' },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div class="confirm-overlay" @click.self="emit('cancel')">
      <div class="confirm-dialog">
        <p class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button class="confirm-cancel" @click="emit('cancel')">{{ cancelLabel }}</button>
          <button class="confirm-ok" @click="emit('confirm')">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-lg);
}

.confirm-dialog {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 320px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.confirm-message {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-text);
  margin-bottom: var(--space-xl);
}

.confirm-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.confirm-cancel {
  font-family: var(--font-ui);
  font-size: 0.9rem;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
.confirm-cancel:hover { color: var(--color-text); }

.confirm-ok {
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 600;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-bg);
}
.confirm-ok:hover { background: var(--color-primary-hover); }
</style>
