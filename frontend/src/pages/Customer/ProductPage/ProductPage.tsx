import React, { useEffect, useMemo, useState } from "react";
import { Card, Pagination, message } from "antd";
import dayjs from "dayjs";

import FilterSidebar from "./FilterSidebar";
import RoomGrid from "./RoomGrid";
import TopBar, { type SortValue } from "./TopBar";
import type { RoomCardItem } from "./types";

import postsService, {
  type PostSummaryResponse,
} from "../../../services/posts/posts";
import categoriesService from "../../../services/categories/categories";
import amenitiesService from "../../../services/amenities/amenities";
import citiesService, {
  type CityResponse,
} from "../../../services/cities/cities";

type Option =
  | { label: string; value: number }
  | { label: string; value: string };

const toSortParam = (sort: SortValue): string | undefined => {
  switch (sort) {
    case "PRICE_ASC":
      return "price,asc";
    case "PRICE_DESC":
      return "price,desc";
    case "NEWEST":
      return "createdAt,desc";
    default:
      return undefined;
  }
};

const mapPostToCard = (p: PostSummaryResponse): RoomCardItem => ({
  postId: p.postId,
  title: p.title,
  roomName: p.roomName,
  price: p.price ?? null,
  capacity: p.capacity ?? null,
  rentalAreaName: p.rentalAreaName ?? null,
  city: null,
  coverImageUrl: p.roomCoverImageUrl || p.rentalAreaCoverImageUrl || null,
});

const ProductsPage: React.FC = () => {
  // Filters
  const [city, setCity] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<any>(dayjs());
  const [timeRange, setTimeRange] = useState<[number, number]>([8, 18]);

  // slider sức chứa
  const [capacityRange, setCapacityRange] = useState<[number, number]>([
    10, 30,
  ]);

  const [amenityIds, setAmenityIds] = useState<number[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

  // options (from API)
  const [cityOptions, setCityOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [amenityOptions, setAmenityOptions] = useState<
    { label: string; value: number }[]
  >([]);

  // Sort + paging
  const [sort, setSort] = useState<SortValue>("POPULARITY");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // API state
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RoomCardItem[]>([]);
  const [total, setTotal] = useState(0);

  // fetch filter options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cRes, aRes, cityRes] = await Promise.all([
          categoriesService.getAllCategories(),
          amenitiesService.getAllAmenities(),
          citiesService.getAllCities(),
        ]);

        setCategoryOptions(
          (cRes.result || [])
            .slice()
            .sort((x: any, y: any) =>
              x.categoryName.localeCompare(y.categoryName),
            )
            .map((c: any) => ({ label: c.categoryName, value: c.categoryId })),
        );

        setAmenityOptions(
          (aRes.result || [])
            .slice()
            .sort((x: any, y: any) =>
              x.amenityName.localeCompare(y.amenityName),
            )
            .map((a: any) => ({ label: a.amenityName, value: a.amenityId })),
        );

        setCityOptions(
          (cityRes.result || []).map((c: CityResponse) => ({
            label: c.cityName,
            value: c.cityId,
          })),
        );
      } catch (e) {
        console.error(e);
        message.error("Không tải được danh sách bộ lọc");
      }
    };

    fetchOptions();
  }, []);

  const fetchPublic = async () => {
    setLoading(true);
    try {
      const res = await postsService.getPublicPosts({
        page,
        size: pageSize,
        city: city || undefined,
        categoryId: categoryId ?? undefined,
        amenityIds: amenityIds.length ? amenityIds : undefined,
        capacityMin: capacityRange[0],
        capacityMax: capacityRange[1],
        sort: toSortParam(sort),
      });

      if (res.code !== 200) {
        message.error(res.message || "Tải danh sách phòng thất bại");
        setItems([]);
        setTotal(0);
        return;
      }

      // result dạng PageResponse<PostSummaryResponse>
      const pageData = res.result;
      setItems((pageData.data || []).map(mapPostToCard));
      setTotal(pageData.totalElements || 0);
    } catch (e: any) {
      console.error(e);
      message.error(
        e?.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu",
      );
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublic();
  }, [page, pageSize, city, categoryId, amenityIds, capacityRange, sort]);

  const onView = (postId: string) => {
    console.log("view", postId);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-4">
      <div className="px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 xl:col-span-3">
            <FilterSidebar
              city={city}
              cityOptions={cityOptions}
              onCityChange={(v) => {
                setCity(v);
                setPage(1);
              }}
              date={date}
              onDateChange={(v) => {
                setDate(v);
                setPage(1);
              }}
              timeRange={timeRange}
              onTimeRangeChange={(v) => {
                setTimeRange(v);
                setPage(1);
              }}
              capacityRange={capacityRange}
              onCapacityRangeChange={(v) => {
                setCapacityRange(v);
                setPage(1);
              }}
              amenityIds={amenityIds}
              amenityOptions={amenityOptions}
              onAmenityAdd={(id) => {
                setAmenityIds((prev) =>
                  prev.includes(id) ? prev : [...prev, id],
                );
                setPage(1);
              }}
              onAmenityRemove={(id) => {
                setAmenityIds((prev) => prev.filter((x) => x !== id));
                setPage(1);
              }}
              categoryId={categoryId}
              categoryOptions={categoryOptions}
              onCategoryChange={(id) => {
                setCategoryId(id);
                setPage(1);
              }}
            />
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <TopBar
              total={total}
              sort={sort}
              onSortChange={(v) => {
                setSort(v);
                setPage(1);
              }}
            />

            <RoomGrid data={items} loading={loading} onView={onView} />

            <Card className="mt-4 shadow-sm rounded-xl">
              <div className="flex justify-center">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={(p, s) => {
                    setPage(p);
                    setPageSize(s);
                  }}
                  showSizeChanger
                  pageSizeOptions={["6", "9", "12", "18"]}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
