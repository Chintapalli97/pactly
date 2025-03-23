
export type AgreementStatus = 'pending' | 'accepted' | 'declined';

export type Agreement = {
  id: string;
  message: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  recipientId?: string;
  recipientName?: string;
  status: AgreementStatus;
  deleteRequestedBy: string[];
  isDeleted?: boolean;
};

// Type for database operations
export type AgreementDB = {
  id: string;
  message: string; // Required field
  created_at: string;
  creator_id: string | null;
  creator_name: string | null;
  recipient_id: string | null;
  recipient_name: string | null;
  status: string;
  delete_requested_by: string[];
  is_deleted: boolean;
};

// Convert from database format to application format
export function mapDBAgreementToAgreement(dbAgreement: AgreementDB): Agreement {
  return {
    id: dbAgreement.id,
    message: dbAgreement.message,
    createdAt: dbAgreement.created_at,
    creatorId: dbAgreement.creator_id || '',
    creatorName: dbAgreement.creator_name || 'Anonymous',
    recipientId: dbAgreement.recipient_id || undefined,
    recipientName: dbAgreement.recipient_name || undefined,
    status: dbAgreement.status as AgreementStatus,
    deleteRequestedBy: dbAgreement.delete_requested_by || [],
    isDeleted: dbAgreement.is_deleted
  };
}

// Convert from application format to database format
export function mapAgreementToDBFormat(agreement: Agreement): AgreementDB {
  return {
    id: agreement.id,
    message: agreement.message, // Ensuring this is always passed
    created_at: agreement.createdAt,
    creator_id: agreement.creatorId || null,
    creator_name: agreement.creatorName || null,
    recipient_id: agreement.recipientId || null,
    recipient_name: agreement.recipientName || null,
    status: agreement.status,
    delete_requested_by: agreement.deleteRequestedBy || [],
    is_deleted: agreement.isDeleted || false
  };
}
