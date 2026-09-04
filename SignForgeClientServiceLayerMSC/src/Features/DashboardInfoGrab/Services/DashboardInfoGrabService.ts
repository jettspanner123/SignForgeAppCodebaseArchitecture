import ApplicationNetworkAPIConfiguration from '../../../Configurations/ApplicationNetworkAPIConfiguration';
import ApplicationLocalStorageService from '../../../Services/ApplicationLocalStorageService';
import EmploymentOfferService, { BackendEmploymentOfferDTO, ApiResponseEnvelope } from '../../EmploymentOffer/Services/EmploymentOfferService';
import DashboardInfoGrabResponseInterfaceModel from '../../../Models/DashboardInfoGrabResponseInterfaceModel';
import DashboardKpiMetricsInterfaceModel from '../../../Models/DashboardKpiMetricsInterfaceModel';
import DashboardActivityInterfaceModel from '../../../Models/DashboardActivityInterfaceModel';

export interface BackendDashboardKpiMetricsDTO {
  TotalPipeline?: number;
  totalPipeline?: number;
  AwaitingCandidate?: number;
  awaitingCandidate?: number;
  AwaitingCountersign?: number;
  awaitingCountersign?: number;
  AwaitingThirdPartySign?: number;
  awaitingThirdPartySign?: number;
  FullyExecuted?: number;
  fullyExecuted?: number;
  Drafts?: number;
  drafts?: number;
  Cancelled?: number;
  cancelled?: number;
  Expired?: number;
  expired?: number;
  TotalCompensationValue?: number;
  totalCompensationValue?: number;
  ExecutionRatePercentage?: number;
  executionRatePercentage?: number;
}

export interface BackendDashboardActivityDTO {
  Id?: string;
  id?: string;
  OfferId?: string;
  offerId?: string;
  OfferCode?: string;
  offerCode?: string;
  CandidateName?: string;
  candidateName?: string;
  Designation?: string;
  designation?: string;
  Action?: string;
  action?: string;
  Details?: string;
  details?: string;
  Timestamp?: string;
  timestamp?: string;
  ActorName?: string;
  actorName?: string;
  ActorRole?: string;
  actorRole?: string;
}

export interface BackendDashboardInfoGrabDTO {
  Metrics?: BackendDashboardKpiMetricsDTO;
  metrics?: BackendDashboardKpiMetricsDTO;
  RecentActivities?: BackendDashboardActivityDTO[];
  recentActivities?: BackendDashboardActivityDTO[];
  Offers?: BackendEmploymentOfferDTO[];
  offers?: BackendEmploymentOfferDTO[];
}

export default class DashboardInfoGrabService {
  public static readonly current = new DashboardInfoGrabService();

  private getAuthHeaders(): HeadersInit {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const session = ApplicationLocalStorageService.current.getAuthSession();
    const headers: Record<string, string> = { ...config.headers };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    return headers;
  }

  public async getDashboardData(): Promise<DashboardInfoGrabResponseInterfaceModel> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.dashboardInfoGrab.getDashboardData;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve dashboard information: ${response.statusText}`);
    }

    const payload: ApiResponseEnvelope<BackendDashboardInfoGrabDTO> = await response.json();
    const data = payload.Data || payload.data;

    if (!data) {
      throw new Error(payload.Message || payload.message || 'No dashboard data received.');
    }

    const rawMetrics = data.Metrics || data.metrics;
    const typedMetrics: DashboardKpiMetricsInterfaceModel = {
      totalPipeline: rawMetrics?.TotalPipeline ?? rawMetrics?.totalPipeline ?? 0,
      awaitingCandidate: rawMetrics?.AwaitingCandidate ?? rawMetrics?.awaitingCandidate ?? 0,
      awaitingCountersign: rawMetrics?.AwaitingCountersign ?? rawMetrics?.awaitingCountersign ?? 0,
      awaitingThirdPartySign: rawMetrics?.AwaitingThirdPartySign ?? rawMetrics?.awaitingThirdPartySign ?? 0,
      fullyExecuted: rawMetrics?.FullyExecuted ?? rawMetrics?.fullyExecuted ?? 0,
      drafts: rawMetrics?.Drafts ?? rawMetrics?.drafts ?? 0,
      cancelled: rawMetrics?.Cancelled ?? rawMetrics?.cancelled ?? 0,
      expired: rawMetrics?.Expired ?? rawMetrics?.expired ?? 0,
      totalCompensationValue: rawMetrics?.TotalCompensationValue ?? rawMetrics?.totalCompensationValue ?? 0,
      executionRatePercentage: rawMetrics?.ExecutionRatePercentage ?? rawMetrics?.executionRatePercentage ?? 0,
    };

    const rawActivities = data.RecentActivities || data.recentActivities || [];
    const typedActivities: DashboardActivityInterfaceModel[] = rawActivities.map((act) => ({
      id: act.Id || act.id || '',
      offerId: act.OfferId || act.offerId || '',
      offerCode: act.OfferCode || act.offerCode || '',
      candidateName: act.CandidateName || act.candidateName || '',
      designation: act.Designation || act.designation || '',
      action: act.Action || act.action || '',
      details: act.Details || act.details || '',
      timestamp: act.Timestamp || act.timestamp || new Date().toISOString(),
      actorName: act.ActorName || act.actorName || 'System',
      actorRole: act.ActorRole || act.actorRole || 'HR',
    }));

    const rawOffers = data.Offers || data.offers || [];
    const typedOffers = rawOffers.map((offerDto) => EmploymentOfferService.current.mapDtoToOfferDocument(offerDto));

    return {
      metrics: typedMetrics,
      recentActivities: typedActivities,
      offers: typedOffers,
    };
  }
}
