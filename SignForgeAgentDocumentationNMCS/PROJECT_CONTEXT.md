# SignForge

SignForge is an internal e-signature and offer-letter workflow platform: HR creates an Employment Offer, the Candidate reviews and signs it, HR applies a Countersign, and — for offers that require it — an Executive applies the Third-Party Sign that fully executes the document.

## Language

**Employment Offer**:
The core record representing a candidate's offer of employment: its terms, its signers, and its position in the signing pipeline. This is the unit of work everything else in the domain hangs off.
_Avoid_: Contract, offer letter (the letter is the rendered document; the Employment Offer is the record and workflow state)

**Offer Letter**:
The generated document (HTML, later a PDF) that presents an Employment Offer's terms to a signer. There is one Employment Offer per hire, but the Offer Letter is what each party actually reads and signs.
_Avoid_: Contract, agreement

**Candidate**:
The prospective employee who receives an Employment Offer and signs it first, before HR or an Executive act on it.
_Avoid_: Applicant, employee (not an employee until the offer is Fully Executed)

**Countersign**:
The signature an HR Manager or Admin applies to an Employment Offer after the Candidate has signed. It moves the offer from `AWAITING_COUNTERSIGN` toward its next status.
_Avoid_: Approval, HR sign-off

**Third-Party Sign**:
The final signature an Executive Director applies to an Employment Offer that requires one, after HR has countersigned. An offer only reaches `AWAITING_THIRD_PARTY_SIGN` if this signature is required at all; not every offer needs one.
_Avoid_: Final approval, exec sign-off, co-sign

**Sign Mode**:
How a given signer captured their signature: drawn, typed, or (for HR and Executive signers only, not Candidates) uploaded as an image. For a typed signature, the signer's chosen typeface and ink color are part of the signature itself, not incidental styling — they're captured and preserved exactly as chosen, since the document a signer saw and executed is what must be reproduced later, not a generic re-rendering of their name.
_Avoid_: Signature type, signature method

**Status**:
The single field describing where an Employment Offer sits in its signing pipeline: `DRAFT`, `AWAITING_CANDIDATE`, `AWAITING_COUNTERSIGN`, `AWAITING_THIRD_PARTY_SIGN`, `FULLY_EXECUTED`, `CANCELLED`, `REJECTED`, or `EXPIRED`. Every other timestamp and signature field on the offer exists to explain how it arrived at its current Status.
_Avoid_: State, stage, phase

**Fully Executed**:
The terminal, successful Status an Employment Offer reaches once every signature it required — Candidate, Countersign, and Third-Party Sign if applicable — has been applied.
_Avoid_: Completed, signed, finalized

**Document Hash**:
A checksum computed over an Employment Offer's rendered content, stored so a later reader can verify the document a signer actually saw was never altered before or after signing.
_Avoid_: Checksum (the verification endpoint is named `verifyChecksum`, but the canonical domain term for the stored value is Document Hash)

**Audit Trail**:
The append-only record, kept per Employment Offer, of every action taken against it — creation, each signature, every status change.
_Avoid_: History, activity log

**Configuration Constant**:
A piece of reference data — a department, designation, or work location — used to populate Employment Offer creation forms. SignForge does not own this data; it is sourced from AssetSphere's database (see AssetSphere below).
_Avoid_: Dropdown option, lookup value

**AssetSphere**:
A separate, sibling internal product (IT hardware and asset management) built by the same team. SignForge reads Configuration Constant data directly from AssetSphere's database rather than owning it itself.
_Avoid_: n/a — proper noun naming another product
