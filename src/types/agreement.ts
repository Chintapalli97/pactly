
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
};
