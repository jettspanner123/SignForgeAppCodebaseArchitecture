import { OfferDocument } from '../Types';
import DashboardKpiMetricsInterfaceModel from './DashboardKpiMetricsInterfaceModel';
import DashboardActivityInterfaceModel from './DashboardActivityInterfaceModel';

export interface DashboardInfoGrabResponseInterfaceModel {
  metrics: DashboardKpiMetricsInterfaceModel;
  recentActivities: DashboardActivityInterfaceModel[];
  offers: OfferDocument[];
}

export default DashboardInfoGrabResponseInterfaceModel;
