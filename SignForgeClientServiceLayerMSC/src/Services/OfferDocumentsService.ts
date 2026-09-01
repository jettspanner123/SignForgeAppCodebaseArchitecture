import { OfferDocument, AuditEvent } from '../Types';
import ApplicationThemeCON from '../Constants/ApplicationThemeCON';
import MockDataSeederService from './MockDataSeederService';

export default class OfferDocumentsService {
  public static readonly current = new OfferDocumentsService();

  public getDocuments(): OfferDocument[] {
    try {
      const raw = localStorage.getItem(ApplicationThemeCON.STORAGE_KEY_DOCUMENTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load documents from storage:', e);
    }
    
    // Seed initial high-fidelity data if empty
    const initial = MockDataSeederService.current.getInitialOfferDocuments();
    this.saveDocuments(initial);
    return initial;
  }

  public saveDocuments(documents: OfferDocument[]): void {
    try {
      localStorage.setItem(ApplicationThemeCON.STORAGE_KEY_DOCUMENTS, JSON.stringify(documents));
    } catch (e) {
      console.error('Failed to persist documents to storage:', e);
    }
  }

  public getDocumentById(id: string): OfferDocument | undefined {
    const docs = this.getDocuments();
    return docs.find((d) => d.id === id);
  }

  public addDocument(doc: OfferDocument): OfferDocument[] {
    const docs = this.getDocuments();
    const updated = [doc, ...docs.filter((d) => d.id !== doc.id)];
    this.saveDocuments(updated);
    return updated;
  }

  public updateDocument(doc: OfferDocument): OfferDocument[] {
    const docs = this.getDocuments();
    const updated = docs.map((d) => (d.id === doc.id ? doc : d));
    this.saveDocuments(updated);
    return updated;
  }

  public deleteDocument(id: string): OfferDocument[] {
    const docs = this.getDocuments();
    const updated = docs.filter((d) => d.id !== id);
    this.saveDocuments(updated);
    return updated;
  }

  public appendAuditEvent(docId: string, event: AuditEvent): OfferDocument | undefined {
    const docs = this.getDocuments();
    const target = docs.find((d) => d.id === docId);
    if (!target) return undefined;

    const updatedDoc: OfferDocument = {
      ...target,
      updatedAt: new Date().toISOString(),
      auditTrail: [...(target.auditTrail || []), event]
    };

    this.updateDocument(updatedDoc);
    return updatedDoc;
  }
}
