export interface UserSummaryModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string | null;
  avatarUrl: string | null;
  fullName?: string;
}

export interface CreateFeatureRequestPayload {
  targetUserId: string;
  title: string;
  featureType: string;
  description: string;
}

export interface FeatureRequestResponseModel {
  id: string;
  requesterUserId: string;
  requesterUser?: UserSummaryModel | null;
  targetUserId: string;
  targetUser?: UserSummaryModel | null;
  title: string;
  featureType: string;
  description: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
