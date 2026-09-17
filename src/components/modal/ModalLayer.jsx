import { createPortal } from 'react-dom';

export default function ModalLayer({ children }) {
  return typeof document === 'undefined' ? children : createPortal(children, document.body);
}
