export interface DashboardKpiMetricsInterfaceModel {
  totalPipeline: number;
  awaitingCandidate: number;
  awaitingCountersign: number;
  awaitingThirdPartySign: number;
  fullyExecuted: number;
  drafts: number;
  cancelled: number;
  expired: number;
  totalCompensationValue: number;
  executionRatePercentage: number;
}

export default DashboardKpiMetricsInterfaceModel;
