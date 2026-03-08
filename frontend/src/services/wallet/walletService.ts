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
