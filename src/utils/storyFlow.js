export function advanceStoryModal(modal, setModal) {
  if (!modal) return;
  setModal(null);
  modal.onClose?.();
}
