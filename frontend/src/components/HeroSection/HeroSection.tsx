import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiMapPin, FiCalendar } from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import backgroundHeroSection from "../../assets/backgroundHeroSection.jpg";
import introLandingVideo from "../../assets/intro_landing_page.mp4";

type CityItem = {
  cityId: number;
  cityName: string;
};

type CategoryItem = {
  categoryId: number;
  categoryName: string;
};

type HeroSectionProps = {
  cities?: CityItem[];
  categories?: CategoryItem[];
  selectedCityId?: number;
  selectedCategoryId?: number;
  onCityChange?: (value: number | undefined) => void;
  onCategoryChange?: (value: number | undefined) => void;
  onSearch?: () => void;
};

const HeroSection = ({
  cities = [],
  categories = [],
  selectedCityId,
  selectedCategoryId,
  onCityChange,
  onCategoryChange,
  onSearch,
}: HeroSectionProps) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isRoomTypeOpen, setIsRoomTypeOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [quickCategoryStart, setQuickCategoryStart] = useState(0);

  const visibleQuickCategories = categories.slice(
    quickCategoryStart,
    quickCategoryStart + 6,
  );

  const canSlideQuickLeft = quickCategoryStart > 0;
  const canSlideQuickRight = quickCategoryStart + 6 < categories.length;

  const dateRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const cityRef = useRef<HTMLDivElement | null>(null);
  const cityDropdownRef = useRef<HTMLDivElement | null>(null);
  const roomTypeRef = useRef<HTMLDivElement | null>(null);
  const roomTypeDropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedCityName = useMemo(() => {
    return (
      cities.find((item) => item.cityId === selectedCityId)?.cityName ||
      "Chọn địa điểm"
    );
  }, [cities, selectedCityId]);

  const selectedRoomTypeName = useMemo(() => {
    return (
      categories.find((item) => item.categoryId === selectedCategoryId)
        ?.categoryName || "Tất cả Phòng học"
    );
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (isDateOpen) {
        const clickedInsideDateButton = dateRef.current?.contains(target);
        const clickedInsideCalendar = calendarRef.current?.contains(target);

        if (!clickedInsideDateButton && !clickedInsideCalendar) {
          setIsDateOpen(false);
        }
      }

      if (isCityOpen) {
        const clickedInsideCityButton = cityRef.current?.contains(target);
        const clickedInsideCityDropdown =
          cityDropdownRef.current?.contains(target);

        if (!clickedInsideCityButton && !clickedInsideCityDropdown) {
          setIsCityOpen(false);
        }
      }

      if (isRoomTypeOpen) {
        const clickedInsideRoomTypeButton =
          roomTypeRef.current?.contains(target);
        const clickedInsideRoomTypeDropdown =
          roomTypeDropdownRef.current?.contains(target);

        if (!clickedInsideRoomTypeButton && !clickedInsideRoomTypeDropdown) {
          setIsRoomTypeOpen(false);
        }
      }
    };

    if (isDateOpen || isCityOpen || isRoomTypeOpen) {
      document.addEventListener("click", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isDateOpen, isCityOpen, isRoomTypeOpen]);

  useEffect(() => {
    if (isDateOpen) {
      const styleId = "calendar-z-index-fix";
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      styleElement.textContent = `
        [data-calendar-portal] {
          z-index: 999999 !important;
          position: fixed !important;
          isolation: isolate !important;
        }
      `;

      return () => {};
    }
  }, [isDateOpen]);

  useEffect(() => {
    const styleId = "room-type-dropdown-scrollbar-hide";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      [data-room-type-dropdown]::-webkit-scrollbar {
        display: none;
      }
    `;

    return () => {};
  }, []);

  const formatDateRangeLabel = () => {
    if (!checkIn && !checkOut) return "";
    if (checkIn && !checkOut) return `Nhận: ${checkIn}`;
    if (!checkIn && checkOut) return `Trả: ${checkOut}`;
    return `${checkIn} - ${checkOut}`;
  };

  const applyPresetDays = (days: number) => {
    const today = new Date();
    const start = today.toISOString().slice(0, 10);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days - 1);
    const end = endDate.toISOString().slice(0, 10);
    setCheckIn(start);
    setCheckOut(end);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDateToYYYYMMDD = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateToYYYYMMDD(date);

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut("");
    } else if (checkIn && !checkOut) {
      if (new Date(dateStr) < new Date(checkIn)) {
        setCheckOut(checkIn);
        setCheckIn(dateStr);
      } else {
        setCheckOut(dateStr);
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    const dateStr = formatDateToYYYYMMDD(date);
    return dateStr >= checkIn && dateStr <= checkOut;
  };

  const isDateSelected = (date: Date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    return dateStr === checkIn || dateStr === checkOut;
  };

  const isDateToday = (date: Date) => {
    const today = new Date();
    return formatDateToYYYYMMDD(date) === formatDateToYYYYMMDD(today);
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
      return;
    }

    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (selectedCityId) params.set("cityId", String(selectedCityId));
    if (selectedCategoryId)
      params.set("categoryId", String(selectedCategoryId));
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <div className="relative w-full -mt-16 flex items-start justify-center pt-0 pb-10 md:pb-14 min-h-screen min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={backgroundHeroSection}
          aria-hidden="true"
          disablePictureInPicture
        >
          <source src={introLandingVideo} type="video/mp4" />
        </video>

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(77,166,255,0.45) 0%, rgba(77,166,255,0.35) 50%, rgba(59,130,246,0.45) 100%)",
          }}
        />
      </div>

      <div className="absolute inset-0 z-10 bg-linear-to-b from-black/20 via-transparent to-black/10" />

      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 pt-[calc(4rem+2rem)] md:pt-[calc(4rem+3rem)] text-white">
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-3 drop-shadow-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          EduRoom
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mb-1 md:mb-1.5 font-medium drop-shadow-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Nền tảng cho thuê phòng học hàng đầu
        </motion.p>

        <motion.p
          className="text-base md:text-lg opacity-95 drop-shadow-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Tìm phòng học phù hợp cho mọi nhu cầu học tập
        </motion.p>

        <motion.div
          className="mt-1.5 md:mt-2 w-full max-w-5xl mx-auto relative z-[100]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row items-stretch bg-white/95 rounded-3xl shadow-2xl border border-[#4da6ff] px-3 py-2 md:px-4 md:py-3 gap-2 md:gap-3 text-gray-900">
            <div className="flex-1 flex items-center gap-2 px-1">
              <FiSearch className="text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tìm phòng học..."
                className="w-full bg-transparent outline-none text-sm md:text-base placeholder:text-gray-400"
              />
            </div>

            <div className="hidden md:block w-px bg-gray-200" />

            <div
              ref={cityRef}
              className="relative flex items-center gap-2 bg-white rounded-2xl px-3 py-2 border border-gray-200 flex-1 lg:flex-none lg:w-52 cursor-pointer hover:border-[#4da6ff] transition-colors"
              onClick={() => setIsCityOpen((prev) => !prev)}
            >
              <FiMapPin className="text-yellow-500 w-4 h-4 shrink-0" />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Địa điểm
                </span>
                <span className="text-xs md:text-sm text-gray-800">
                  {selectedCityName}
                </span>
              </div>

              {isCityOpen && (
                <div
                  ref={cityDropdownRef}
                  className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-[#4da6ff] py-2 z-[999999] w-full min-w-[200px] max-h-[300px] overflow-y-auto"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCityChange?.(undefined);
                      setIsCityOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                      selectedCityId == null
                        ? "bg-blue-50 text-[#4da6ff] font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    Tất cả địa điểm
                  </button>

                  {cities.map((c) => (
                    <button
                      key={c.cityId}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCityChange?.(c.cityId);
                        setIsCityOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                        selectedCityId === c.cityId
                          ? "bg-blue-50 text-[#4da6ff] font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      {c.cityName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              ref={dateRef}
              className="relative flex items-center gap-2 bg-white rounded-2xl px-3 py-2 border border-gray-200 flex-1 lg:flex-none lg:w-52 cursor-pointer hover:border-[#4da6ff] transition-colors"
              onClick={() => setIsDateOpen((prev) => !prev)}
            >
              <FiCalendar className="text-yellow-500 w-4 h-4 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nhận - Trả phòng
                </span>
                <span className="text-xs md:text-sm text-gray-800">
                  {formatDateRangeLabel()}
                </span>
              </div>

              {isDateOpen && (
                <div
                  ref={calendarRef}
                  className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-[#4da6ff] p-2.5 text-gray-900 z-[999999]"
                  style={{
                    width: "280px",
                    pointerEvents: "auto",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPreviousMonth();
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <h3 className="text-xs font-semibold text-gray-800">
                      {currentMonth.toLocaleDateString("vi-VN", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNextMonth();
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                    {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-[10px] font-semibold text-gray-500 py-0.5"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 mb-2">
                    {getDaysInMonth(currentMonth).map((date, index) => {
                      if (!date) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="aspect-square"
                          />
                        );
                      }

                      const dateStr = formatDateToYYYYMMDD(date);
                      const inRange = isDateInRange(date);
                      const selected = isDateSelected(date);
                      const today = isDateToday(date);
                      const past = isDatePast(date);

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!past) {
                              handleDateClick(date);
                            }
                          }}
                          disabled={past}
                          className={`
                            aspect-square text-[10px] font-medium rounded-md transition-all flex items-center justify-center
                            ${past ? "text-gray-300 cursor-not-allowed opacity-50" : "hover:bg-blue-50 cursor-pointer text-gray-700"}
                            ${today && !selected ? "border border-[#4da6ff] font-semibold" : ""}
                            ${inRange && !selected ? "bg-blue-100" : ""}
                            ${selected ? "bg-[#4da6ff] text-white font-bold" : ""}
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {(checkIn || checkOut) && (
                    <div className="mb-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-[10px] text-gray-700 space-y-0.5">
                        {checkIn && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Ngày nhận:</span>
                            <span>
                              {new Date(checkIn).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        {checkOut && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Ngày trả:</span>
                            <span>
                              {new Date(checkOut).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[1, 2, 3, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          applyPresetDays(d);
                        }}
                        className="flex items-center gap-0.5 px-2 py-1 rounded-full border border-gray-300 text-[10px] hover:border-[#4da6ff] hover:text-[#4da6ff] hover:bg-blue-50 transition-colors"
                      >
                        <span className="text-xs leading-none">+</span>
                        {d} ngày
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCheckIn("");
                        setCheckOut("");
                      }}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Xóa
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDateOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              ref={roomTypeRef}
              className="relative flex items-center gap-2 bg-white rounded-2xl px-3 py-2 border border-gray-200 flex-1 lg:flex-none lg:w-52 cursor-pointer hover:border-[#4da6ff] transition-colors"
              onClick={() => setIsRoomTypeOpen((prev) => !prev)}
            >
              <FaChalkboardTeacher className="text-yellow-500 w-4 h-4 shrink-0" />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Loại phòng
                </span>
                <span className="text-xs md:text-sm text-gray-800">
                  {selectedRoomTypeName}
                </span>
              </div>

              {isRoomTypeOpen && (
                <div
                  ref={roomTypeDropdownRef}
                  data-room-type-dropdown
                  className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-[#4da6ff] py-2 z-[999999] w-full min-w-[200px] max-h-[300px] overflow-y-auto"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategoryChange?.(undefined);
                      setIsRoomTypeOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                      selectedCategoryId == null
                        ? "bg-blue-50 text-[#4da6ff] font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    Tất cả Phòng học
                  </button>

                  {categories.map((t) => (
                    <button
                      key={t.categoryId}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryChange?.(t.categoryId);
                        setIsRoomTypeOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                        selectedCategoryId === t.categoryId
                          ? "bg-blue-50 text-[#4da6ff] font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      {t.categoryName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="w-full md:w-auto md:min-w-[130px] h-11 md:h-12 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm md:text-base flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            >
              Tìm phòng
            </button>
          </div>
        </motion.div>

        <motion.div
          className="mt-1.5 md:mt-2 flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          {categories.length > 6 && (
            <button
              type="button"
              onClick={() =>
                setQuickCategoryStart((prev) => Math.max(0, prev - 1))
              }
              disabled={!canSlideQuickLeft}
              className="shrink-0 w-9 h-9 rounded-full border border-white/60 bg-white/10 backdrop-blur text-white hover:bg-white hover:text-[#2563eb] hover:border-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:text-white"
              aria-label="Xem loại phòng trước"
            >
              ‹
            </button>
          )}

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {visibleQuickCategories.map((category) => (
              <button
                key={category.categoryId}
                type="button"
                onClick={() => {
                  onCategoryChange?.(category.categoryId);
                  const params = new URLSearchParams();

                  if (selectedCityId != null) {
                    params.set("cityId", String(selectedCityId));
                  }

                  params.set("categoryId", String(category.categoryId));

                  navigate(`/products?${params.toString()}`);
                }}
                className={`px-3 md:px-4 py-1.5 rounded-full border shadow-sm transition-all ${
                  selectedCategoryId === category.categoryId
                    ? "bg-white text-[#2563eb] border-white"
                    : "border-white/60 bg-white/10 backdrop-blur text-white hover:bg-white hover:text-[#2563eb] hover:border-white"
                }`}
              >
                {category.categoryName}
              </button>
            ))}
          </div>

          {categories.length > 6 && (
            <button
              type="button"
              onClick={() =>
                setQuickCategoryStart((prev) =>
                  Math.min(categories.length - 6, prev + 1),
                )
              }
              disabled={!canSlideQuickRight}
              className="shrink-0 w-9 h-9 rounded-full border border-white/60 bg-white/10 backdrop-blur text-white hover:bg-white hover:text-[#2563eb] hover:border-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:text-white"
              aria-label="Xem loại phòng tiếp"
            >
              ›
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
