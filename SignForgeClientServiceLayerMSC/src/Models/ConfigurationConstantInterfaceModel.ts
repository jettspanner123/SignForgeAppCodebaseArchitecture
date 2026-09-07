export default interface ConfigurationConstantInterfaceModel {
  id: string;
  configurationKey: string;
  configurationValue: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
