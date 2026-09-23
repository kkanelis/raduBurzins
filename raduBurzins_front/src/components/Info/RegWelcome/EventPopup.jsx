import React from 'react';
import BasePopup from '../../components/BasePopoup';

function EventPopup({ selectedEvent, onClose }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('lv-LV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!selectedEvent) return null;

  return (
    <BasePopup title={selectedEvent.title} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-muted"><strong>Apraksts:</strong> {selectedEvent.description || 'Nav apraksta.'}</p>
        <p className="text-sm"><strong>Datums:</strong> {formatDate(selectedEvent.date)}</p>
      </div>
    </BasePopup>
  );
}

export default EventPopup;
