import React from 'react';
import { OfferDocument } from '../Types';
import UploadPDFScreenController from '../Features/UploadPDF/UploadPDFScreenController';

export interface UploadPdfEditorProps {
  onSaveAndSend: (doc: OfferDocument) => void;
  onCancel: () => void;
  onSwitchToTemplate?: () => void;
}

/**
 * UploadPdfEditor Bridge Component.
 * Delegates to UploadPDFScreenController.
 */
export const UploadPdfEditor: React.FC<UploadPdfEditorProps> = (props) => {
  return <UploadPDFScreenController {...props} />;
};

export default UploadPdfEditor;
