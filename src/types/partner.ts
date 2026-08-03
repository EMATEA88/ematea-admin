export interface PartnerStatistics {
  providers: number;
  services: number;
  plans: number;
  requests: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  requestsCount?: number;
  lastRequestAt?: string | null;
  lastSyncAt?: string | null;
}

export interface Partner {
  id: number;
  name: string;
  type: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  isActive: boolean;
  isSandbox: boolean;
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string | null;
  tokenExpiresAt?: string | null;
  statistics: PartnerStatistics;
  providers?: any[];
  services?: any[];
  servicePlans?: any[];
}

export interface PartnerHealth {
  online: boolean;
  sandbox: boolean;
  active: boolean;
  lastSyncAt?: string | null;
  tokenExpiresAt?: string | null;
  totalProviders: number;
  totalServices: number;
  totalPlans: number;
}

export interface PartnerChartsData {
  sales: { createdAt: string; amount: number; profit: number }[];
  status: { status: string; count: number }[];
}

export interface ServiceRequestItem {
  id: number;
  createdAt: string;
  customerName?: string;
  customerReference?: string;
  serviceName?: string;
  providerName?: string;
  amount: number;
  profit: number;
  status: string;
  externalProviderRef?: string;
  Service?: { name: string };
  provider?: { name: string };
}

export interface PartnerDashboardData {
  partner: Partner;
  overview: {
    totalSales: number;
    totalCost: number;
    totalProfit: number;
    requestsCount: number;
  };
  latestRequests: ServiceRequestItem[];
  charts: PartnerChartsData;
  health: PartnerHealth;
  catalog: {
    providers: any[];
    services: any[];
    plans: any[];
  };
}