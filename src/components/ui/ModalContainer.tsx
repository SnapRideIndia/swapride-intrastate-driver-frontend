import React, { useEffect, useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { subscribeModal, type ModalOptions } from '../../lib/modal';

const ModalContainer = () => {
  const [current, setCurrent] = useState<ModalOptions | null>(null);

  useEffect(() => {
    const unsub = subscribeModal(options => {
      setCurrent(options);
    });
    return unsub;
  }, []);

  if (!current) {
    return null;
  }

  return (
    <ConfirmModal
      visible
      options={current}
      onClose={() => setCurrent(null)}
    />
  );
};

export default ModalContainer;
