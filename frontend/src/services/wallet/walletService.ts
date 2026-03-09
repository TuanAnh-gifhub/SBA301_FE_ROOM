import api from "../../config/axios";

export type CreateDepositLinkResponse = {
  paymentUrl: string;
  orderCode: string;
};

export type WalletInfoResponse = {
  walletId: string;
  balance: number;
  frozenAmount: number;
  isFrozen: boolean;
  frozenReason?: string;
  createdAt: string;
};

export type WalletTxType =
  | "DEPOSIT"
  | "PAYMENT"
  | "WITHDRAW"
  | "WITHDRAW_REJECTED"
  | "BOOKING_INCOME"
  | "BOOKING_PAYMENT"
  | "PACKAGE_PURCHASE"
  | "COMMISSION"
  | "REFUND"
  | "FREEZE_HOLD"
  | "FREEZE_RELEASE";
export type WalletTxStatus = "PENDING" | "COMPLETED" | "FAILED";
export type WithdrawStatus = "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";

export type WalletTransactionItemResponse = {
  transactionId: string;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  payosOrderCode?: string;
  createdAt: string;
};

export type WalletTransactionPageResponse = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: WalletTransactionItemResponse[];
};

export type CreateWithdrawRequestPayload = {
  amount: number;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
};

export type WithdrawRequestItemResponse = {
  withdrawRequestId: string;
  amount: number;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: WithdrawStatus;
  adminNote?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
};

export type WithdrawRequestPageResponse = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: WithdrawRequestItemResponse[];
};

export type AdminWithdrawRequestItemResponse = {
  withdrawRequestId: string;
  walletId: string;
  userId: string;
  userName: string;
  amount: number;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: WithdrawStatus;
  adminNote?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
};

export type AdminWithdrawRequestPageResponse = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: AdminWithdrawRequestItemResponse[];
};

export type UpdateWalletFreezePayload = {
  locked: boolean;
  reason?: string;
};

export type AdminWalletStatusResponse = {
  walletId: string;
  userId: string;
  userName: string;
  balance: number;
  frozenAmount: number;
  walletStatus: "ACTIVE" | "LOCKED";
  frozenReason?: string;
};

export type AdminWalletItemResponse = {
  walletId: string;
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
  frozenAmount: number;
  walletStatus: "ACTIVE" | "LOCKED";
  frozenReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminWalletPageResponse = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: AdminWalletItemResponse[];
};

export type AdminWalletTransactionItemResponse = {
  transactionId: string;
  walletId: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  payosOrderCode?: string;
  withdrawRequestId?: string;
  createdAt: string;
};

export type AdminWalletTransactionPageResponse = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: AdminWalletTransactionItemResponse[];
};

export type CommissionInfoResponse = {
  rate: number;
  custom?: boolean;
  isCustom?: boolean;
  effectiveFrom?: string;
};

export type RevenueOverviewResponse = {
  totalIncome: number;
  totalCommission: number;
  netRevenue: number;
  transactions: WalletTransactionItemResponse[];
};

export type EscrowItemResponse = {
  bookingId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  bookingEndedAt?: string;
  expectedReleaseAt?: string;
  disputeFlag?: boolean;
  disputeNote?: string;
};

export type EscrowSummaryResponse = {
  totalHoldingAmount: number;
  totalCommissionAmount: number;
  totalNetAmount: number;
  items: EscrowItemResponse[];
};

export type UpsertCommissionConfigPayload = {
  rate: number;
  note?: string;
};

export type AdminCommissionConfigResponse = {
  commissionConfigId: string;
  default?: boolean;
  isDefault?: boolean;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  rate: number;
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCommissionConfigListResponse = {
  defaultConfig?: AdminCommissionConfigResponse;
  ownerConfigs: AdminCommissionConfigResponse[];
};

export type AdminEscrowItemResponse = {
  bookingId: string;
  ownerId?: string;
  ownerName?: string;
  renterId?: string;
  renterName?: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  bookingEndedAt?: string;
  expectedReleaseAt?: string;
  disputeFlag?: boolean;
  disputeNote?: string;
};

export type AdminEscrowPageResponse = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: AdminEscrowItemResponse[];
};

export const createDepositLink = async (amount: number) => {
  const res = await api.post("/wallet/deposit/create-link", { amount });
  return res.data.result as CreateDepositLinkResponse;
};

export const getMyWallet = async () => {
  const res = await api.get("/wallet/me");
  return res.data.result as WalletInfoResponse;
};

export const finalizeDepositResult = async (
  orderCode: string,
  status: string,
) => {
  const res = await api.get("/wallet/deposit/result", {
    params: { orderCode, status },
  });
  return res.data.result as { orderCode: string; status: string };
};

export const getMyWalletTransactions = async (page = 1, limit = 20) => {
  const res = await api.get("/wallet/transactions", {
    params: { page, limit },
  });
  return res.data.result as WalletTransactionPageResponse;
};

export const createWithdrawRequest = async (
  payload: CreateWithdrawRequestPayload,
) => {
  const res = await api.post("/wallet/withdraw-requests", payload);
  return res.data.result as WithdrawRequestItemResponse;
};

export const getMyWithdrawRequests = async (
  page = 1,
  limit = 20,
  status?: WithdrawStatus,
) => {
  const res = await api.get("/wallet/withdraw-requests", {
    params: { page, limit, status },
  });
  return res.data.result as WithdrawRequestPageResponse;
};

export const getAdminWithdrawRequests = async (
  page = 1,
  limit = 20,
  status?: WithdrawStatus,
  userId?: string,
) => {
  const res = await api.get("/wallet/admin/withdraw-requests", {
    params: { page, limit, status, userId },
  });
  return res.data.result as AdminWithdrawRequestPageResponse;
};

export const approveWithdrawRequest = async (withdrawRequestId: string) => {
  await api.patch(`/wallet/admin/withdraw-requests/${withdrawRequestId}/approve`);
};

export const rejectWithdrawRequest = async (
  withdrawRequestId: string,
  adminNote: string,
) => {
  await api.patch(`/wallet/admin/withdraw-requests/${withdrawRequestId}/reject`, {
    adminNote,
  });
};

export const updateWalletFreezeStatus = async (
  userId: string,
  payload: UpdateWalletFreezePayload,
) => {
  const res = await api.patch(`/wallet/admin/users/${userId}/freeze`, payload);
  return res.data.result as AdminWalletStatusResponse;
};

export const getAdminWallets = async (
  page = 1,
  limit = 20,
  keyword?: string,
  walletStatus?: "ACTIVE" | "LOCKED",
  userId?: string,
) => {
  const res = await api.get("/wallet/admin/wallets", {
    params: { page, limit, keyword, walletStatus, userId },
  });
  return res.data.result as AdminWalletPageResponse;
};

export const getAdminWalletTransactions = async (
  page = 1,
  limit = 20,
  params?: {
    type?: WalletTxType;
    status?: WalletTxStatus;
    fromDate?: string;
    toDate?: string;
    keyword?: string;
    userId?: string;
    walletId?: string;
  },
) => {
  const res = await api.get("/wallet/admin/transactions", {
    params: { page, limit, ...params },
  });
  return res.data.result as AdminWalletTransactionPageResponse;
};

export const getMyCommission = async () => {
  const res = await api.get("/wallet/commission");
  return res.data.result as CommissionInfoResponse;
};

export const getMyRevenue = async (fromDate?: string, toDate?: string) => {
  const res = await api.get("/wallet/revenue", {
    params: { fromDate, toDate },
  });
  return res.data.result as RevenueOverviewResponse;
};

export const getMyPendingEscrow = async () => {
  const res = await api.get("/wallet/escrow/pending");
  return res.data.result as EscrowSummaryResponse;
};

export const getAdminCommissionConfigs = async () => {
  const res = await api.get("/wallet/admin/commission-configs");
  return res.data.result as AdminCommissionConfigListResponse;
};

export const upsertDefaultCommission = async (
  payload: UpsertCommissionConfigPayload,
) => {
  const res = await api.put("/wallet/admin/commission/default", payload);
  return res.data.result as AdminCommissionConfigResponse;
};

export const upsertOwnerCommission = async (
  ownerId: string,
  payload: UpsertCommissionConfigPayload,
) => {
  const res = await api.put(`/wallet/admin/commission/owners/${ownerId}`, payload);
  return res.data.result as AdminCommissionConfigResponse;
};

export const getAdminPendingEscrow = async (
  page = 1,
  limit = 20,
  disputedOnly?: boolean,
) => {
  const res = await api.get("/wallet/admin/escrow/pending", {
    params: { page, limit, disputedOnly },
  });
  return res.data.result as AdminEscrowPageResponse;
};

export const updateEscrowDispute = async (
  bookingId: string,
  disputed: boolean,
  note?: string,
) => {
  await api.patch(`/wallet/admin/escrow/${bookingId}/dispute`, { disputed, note });
};

export const triggerEscrowReleaseNow = async () => {
  const res = await api.post("/wallet/admin/escrow/release-now");
  return res.data.result as { releasedCount: number };
};
