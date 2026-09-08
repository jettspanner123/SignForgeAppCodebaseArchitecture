import { OfferDocument, AuditEvent } from '../Types';
import ApplicationThemeCON from '../Constants/ApplicationThemeCON';
import MockDataSeederService from './MockDataSeederService';

export default class OfferDocumentsService {
  public static readonly current = new OfferDocumentsService();

  public getDocuments(): OfferDocument[] {
    return [];
  }

  public saveDocuments(_documents: OfferDocument[]): void {
    // No-op: client side local storage persistence disabled
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
