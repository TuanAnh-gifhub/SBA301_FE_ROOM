/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState } from "react";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaVenusMars,
} from "react-icons/fa";
import authService, {
  type CreateUsersRequest,
} from "../../../services/auth/authService";
import loginIntroVideo from "../../../assets/login_intro_video.mp4";

export interface RegisterPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export type RegisterFormValues = {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  // Cho phép "" để LoginPage có thể dùng cùng type (ban đầu chưa chọn giới tính)
  gender: "" | "MALE" | "FEMALE";
  dateOfBirth: string;
};

// Hàm validate dùng chung cho cả RegisterPage và LoginPage
export const validateRegisterFormValues = (
  values: RegisterFormValues,
): string | null => {
  if (!values.userName.trim()) return "Vui lòng nhập họ và tên.";
  if (!values.email.trim()) return "Vui lòng nhập email.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(values.email)) return "Email không hợp lệ.";

  if (values.phone && !/^0\d{9,10}$/.test(values.phone)) {
    return "Số điện thoại không hợp lệ.";
  }

  if (!values.dateOfBirth) return "Vui lòng chọn ngày sinh.";
  if (!values.gender) return "Vui lòng chọn giới tính.";

  if (!values.password) return "Vui lòng nhập mật khẩu.";
  if (values.password.length < 8) {
    return "Mật khẩu tối thiểu 8 ký tự.";
  }

  if (!values.confirmPassword) return "Vui lòng nhập lại mật khẩu.";
  if (values.password !== values.confirmPassword) {
    return "Mật khẩu nhập lại không khớp.";
  }

  return null;
};

export interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  isSwitchDisabled?: boolean;
  onErrorMessage?: (msg: string) => void;
  onSuccessMessage?: (msg: string) => void;
  variant?: "dark" | "light";
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  isSwitchDisabled = false,
  onErrorMessage,
  onSuccessMessage,
  variant = "dark",
}) => {
  const [values, setValues] = useState<RegisterFormValues>({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPasswordMatch = useMemo(() => {
    return (
      values.password.length > 0 &&
      values.confirmPassword.length > 0 &&
      values.password === values.confirmPassword
    );
  }, [values.password, values.confirmPassword]);

  const isPasswordMismatch = useMemo(() => {
    return values.confirmPassword.length > 0 && !isPasswordMatch;
  }, [values.confirmPassword.length, isPasswordMatch]);

  const handleChange =
    (field: keyof RegisterFormValues) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
      };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onErrorMessage?.("");
    onSuccessMessage?.("");

    const validationError = validateRegisterFormValues(values);
    if (validationError) {
      onErrorMessage?.(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload: CreateUsersRequest = {
        userName: values.userName.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone ?? "",
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        roleName: "RENTER",
      };

      const response = await authService.registerRequest(payload);
      if (response && response.code === 200) {
        const successText =
          "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.";
        onSuccessMessage?.(successText);
        message.success(response.message || "Đăng ký thành công!");
        setValues({
          userName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          gender: "",
          dateOfBirth: "",
        });
      } else {
        const errorText = response?.message || "Lỗi kết nối máy chủ!";
        onErrorMessage?.(errorText);
        message.error(errorText);
      }
    } catch (error: unknown) {
      console.error("Register Error:", error);
      const errorMsg =
        typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message
          ? (
            error as {
              response?: { data?: { message?: string } };
            }
          ).response!.data!.message!
          : "Lỗi kết nối máy chủ!";
      onErrorMessage?.(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7">
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <FaUser className="w-4 h-4 text-blue-600/70" />
            </div>
            <input
              type="text"
              value={values.userName}
              onChange={handleChange("userName")}
              placeholder=" "
              className="peer w-full rounded-lg border-2 border-gray-300 bg-white text-gray-900 text-sm pl-8 pr-3 py-2.5 transition-all duration-150 focus:outline-none focus:border-blue-600 focus:bg-white"
              disabled={loading}
              required
            />
            <label className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 rounded-full bg-white px-1 text-sm text-gray-600 border-2 border-transparent z-10 transition-all duration-150 peer-focus:bg-white peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:border-gray-300 peer-focus:border-blue-600 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[0.65rem] peer-focus:text-blue-700 peer-focus:font-semibold peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-[0.65rem] peer-not-placeholder-shown:text-blue-700 peer-not-placeholder-shown:font-semibold">
              Họ và tên
            </label>
          </div>
        </div>

        <div className="col-span-5">
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <FaPhone className="w-4 h-4 text-blue-600/70" />
            </div>
            <input
              type="tel"
              value={values.phone}
              onChange={handleChange("phone")}
              placeholder=" "
              className="peer w-full rounded-lg border-2 border-gray-300 bg-white text-gray-900 text-sm pl-8 pr-3 py-2.5 transition-all duration-150 focus:outline-none focus:border-blue-600 focus:bg-white"
              disabled={loading}
              pattern="^0\d{9}$"
            />
            <label className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 rounded-full bg-white px-1 text-sm text-gray-600 border-2 border-transparent z-10 transition-all duration-150 peer-focus:bg-white peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:border-gray-300 peer-focus:border-blue-600 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[0.65rem] peer-focus:text-blue-700 peer-focus:font-semibold peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-[0.65rem] peer-not-placeholder-shown:text-blue-700 peer-not-placeholder-shown:font-semibold">
              SĐT
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7">
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <FaCalendarAlt className="w-4 h-4 text-blue-600/70" />
            </div>
            <input
              type="date"
              value={values.dateOfBirth}
              onChange={handleChange("dateOfBirth")}
              className="peer date-input w-full rounded-lg border-2 border-gray-300 bg-white text-gray-900 text-sm pl-8 pr-3 py-2.5 transition-all duration-150 focus:outline-none focus:border-blue-600 focus:bg-white"
              disabled={loading}
              required
            />
            <label
              className={`pointer-events-none absolute left-8 rounded-full bg-white px-1 border-2 border-transparent z-10 transition-all duration-150 peer-focus:bg-white peer-focus:border-blue-600 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[0.65rem] peer-focus:text-blue-700 peer-focus:font-semibold ${
                values.dateOfBirth
                  ? "top-0 -translate-y-1/2 text-[0.65rem] text-blue-700 font-semibold border-gray-300"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-700"
              }`}
              >
              Ngày sinh
            </label>
          </div>
        </div>

        <div className="col-span-5">
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <FaVenusMars className="w-4 h-4 text-blue-600/70" />
            </div>
            <select
              value={values.gender}
              onChange={handleChange("gender")}
              className="peer w-full rounded-lg border-2 border-gray-300 bg-white text-gray-900 text-sm pl-8 pr-3 py-2.5 transition-all duration-150 focus:outline-none focus:border-blue-600 focus:bg-white"
              disabled={loading}
              required
            >
              <option value="" disabled hidden>
                {""}
              </option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
            <label
              className={`pointer-events-none absolute left-8 rounded-full bg-white px-1 border-2 border-transparent z-10 transition-all duration-150 peer-focus:bg-white peer-focus:border-blue-600 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[0.65rem] peer-focus:text-blue-700 peer-focus:font-semibold ${
                values.gender
                  ? "top-0 -translate-y-1/2 text-[0.65rem] text-blue-700 font-semibold border-gray-300"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-700"
              }`}
            >
              Giới tính
            </label>
          </div>
        </div>
      </div>

      <div>
        <div className="relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <FaEnvelope className="w-4 h-4 text-blue-600/70" />
          </div>
          <input
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            placeholder=" "
            className="peer w-full rounded-lg border-2 border-gray-300 bg-white text-gray-900 text-sm pl-8 pr-3 py-2.5 transition-all duration-150 focus:outline-none focus:border-blue-600 focus:bg-white"
            disabled={loading}
            required
          />
          <label className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 rounded-full bg-white px-1 text-sm text-gray-600 border-2 border-transparent z-10 transition-all duration-150 peer-focus:bg-white peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:border-gray-300 peer-focus:border-blue-600 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[0.65rem] peer-focus:text-blue-700 peer-focus:font-semibold peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-[0.65rem] peer-not-placeholder-shown:text-blue-700 peer-not-placeholder-shown:font-semibold">
            Email
          </label>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <FaLock className="w-4 h-4 text-blue-600/70" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange("password")}
              placeholder=" "
              className="peer w-full rounded-lg border-2 border-gray-300 bg-white text-gray-900 text-sm pl-8 pr-9 py-2.5 transition-all duration-150 focus:outline-none focus:border-blue-600 focus:bg-white"
              disabled={loading}
              required
              minLength={8}
            />
            <label className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 rounded-full bg-white px-1 text-sm text-gray-600 border-2 border-transparent z-10 transition-all duration-150 peer-focus:bg-white peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:border-gray-300 peer-focus:border-blue-600 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[0.65rem] peer-focus:text-blue-700 peer-focus:font-semibold peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-[0.65rem] peer-not-placeholder-shown:text-blue-700 peer-not-placeholder-shown:font-semibold">
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-blue-600/80 hover:text-blue-700 focus:outline-none"
            >
              {showPassword ? (
                <FaEyeSlash className="w-4 h-4" />
              ) : (
                <FaEye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="col-span-6">
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <FaLock className="w-4 h-4 text-blue-600/70" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder=" "
              className={`peer w-full rounded-lg border-2 bg-white text-gray-900 text-sm pl-8 pr-9 py-2.5 transition-all duration-150 focus:outline-none focus:bg-white ${
                isPasswordMismatch
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-600"
              }`}
              disabled={loading}
              required
              minLength={8}
            />
            <label
              className={`pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 rounded-full bg-white px-1 text-sm border-2 border-transparent z-10 transition-all duration-150 peer-focus:bg-white peer-not-placeholder-shown:bg-white peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[0.65rem] peer-focus:font-semibold peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-[0.65rem] peer-not-placeholder-shown:font-semibold ${
                isPasswordMismatch
                  ? "text-red-600 peer-not-placeholder-shown:border-red-400 peer-focus:border-red-500 peer-not-placeholder-shown:text-red-600"
                  : "text-gray-600 peer-not-placeholder-shown:border-gray-300 peer-focus:border-blue-600 peer-focus:text-blue-700 peer-not-placeholder-shown:text-blue-700"
              }`}
            >
              {isPasswordMismatch
                ? "Mật khẩu nhập lại không khớp."
                : "Nhập lại mật khẩu"}
            </label>
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-blue-600/80 hover:text-blue-700 focus:outline-none"
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="w-4 h-4" />
              ) : (
                <FaEye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || isPasswordMismatch || !isPasswordMatch}
        className={`w-full bg-[#4da6ff] hover:bg-[#3d8cff] text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm mt-2 ${
          loading || isPasswordMismatch || !isPasswordMatch
            ? "opacity-70 cursor-not-allowed"
            : ""
        }`}
      >
        {loading ? "Đang xử lý..." : "Đăng ký"}
      </button>

      {onSwitchToLogin && (
        <div className="mt-0 text-center">
          <span
            className={`text-sm ${
              variant === "light" ? "text-gray-700" : "text-white"
            }`}
          >
            Đã có tài khoản?{" "}
          </span>
          <button
            type="button"
            disabled={isSwitchDisabled}
            onClick={onSwitchToLogin}
            className={`text-sm font-semibold focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
              variant === "light"
                ? "text-[#4da6ff] hover:text-blue-600"
                : "text-[#4da6ff] hover:text-blue-300"
            }`}
          >
            Đăng nhập ngay
          </button>
        </div>
      )}
    </form>
  );
};

const RegisterPage: React.FC<RegisterPageProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
        {/* Backdrop giống LoginPage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200"
        >
          {/* Close button (global) */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/30 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <FaTimes className="w-3.5 h-3.5 text-white" />
          </button>

          <div className="relative h-[520px] w-full bg-black">
            {/* Video nền full modal */}
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={loginIntroVideo}
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-black/40" />

            {/* Thông tin thương hiệu trên video */}
            <div className="absolute bottom-4 right-4 text-white hidden md:block text-right">
              <div className="text-lg font-semibold">EduRoom</div>
              <div className="text-sm text-white/90">
                Đăng ký ngay để bắt đầu.
              </div>
            </div>

            {/* Thẻ form đè bên trái video */}
            <div className="relative z-10 flex h-full items-center justify-start px-4 sm:px-6">
              <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col overflow-hidden text-sm">
                {/* Header */}
                <div className="relative bg-linear-to-br from-[#4da6ff] to-blue-500 px-5 py-3.5 text-white">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 border-2 border-white rounded-lg flex items-center justify-center">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-center">
                    Tạo Tài Khoản
                  </h2>
                  <p className="text-center text-white/80 text-sm">
                    Đăng ký ngay để bắt đầu.
                  </p>
                </div>

                <div className="px-5 py-2.5 flex-1 overflow-y-auto">
                  <div className="flex items-start min-h-[32px] mb-1">
                    <AnimatePresence mode="wait">
                      {errorMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{
                            duration: 0.2,
                            delay: 0.12,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className="w-full px-2 py-1 bg-red-50 border border-red-200 text-red-600 text-xs leading-snug rounded-md text-center font-semibold"
                        >
                          {errorMessage}
                        </motion.div>
                      )}
                      {successMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{
                            duration: 0.2,
                            delay: 0.12,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className="w-full px-2 py-1 bg-green-50 border border-green-200 text-green-600 text-xs leading-snug rounded-md text-center font-semibold"
                        >
                          {successMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <RegisterForm
                    onSwitchToLogin={onSwitchToLogin}
                    onErrorMessage={setErrorMessage}
                    onSuccessMessage={setSuccessMessage}
                    variant="light"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RegisterPage;