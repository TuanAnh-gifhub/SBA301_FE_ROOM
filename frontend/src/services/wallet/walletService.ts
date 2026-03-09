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

export type WalletTxType = "DEPOSIT" | "PAYMENT" | "REFUND" | "WITHDRAW";
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
