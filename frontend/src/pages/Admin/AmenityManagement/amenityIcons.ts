import * as FaIcons from "react-icons/fa";
import type { IconType } from "react-icons";

type IconMap = Record<string, IconType>;

const rawFaIconEntries = Object.entries(FaIcons).filter(
  ([key, value]) => key.startsWith("Fa") && typeof value === "function",
) as [string, IconType][];

export const AMENITY_ICON_MAP: IconMap = rawFaIconEntries.reduce<IconMap>(
  (acc, [key, icon]) => {
    acc[key] = icon;
    return acc;
  },
  {},
);

export type AmenityIconKey = keyof typeof AMENITY_ICON_MAP;

const formatIconLabel = (key: string) =>
  key
    .replace(/^Fa/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

const normalizeKeyword = (value: string) =>
  value.toLowerCase().replace(/\s+/g, "").trim();

export const AMENITY_ICON_OPTIONS = rawFaIconEntries
  .map(([key]) => ({
    value: key as AmenityIconKey,
    label: formatIconLabel(key),
    searchText: normalizeKeyword(`${key} ${formatIconLabel(key)}`),
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));

export const DEFAULT_AMENITY_ICON: AmenityIconKey = "FaUsers";

export const getAmenityIcon = (iconKey?: string) => {
  if (!iconKey) return AMENITY_ICON_MAP[DEFAULT_AMENITY_ICON];
  return AMENITY_ICON_MAP[iconKey] || AMENITY_ICON_MAP[DEFAULT_AMENITY_ICON];
};

export const searchAmenityIcons = (keyword: string) => {
  const normalized = normalizeKeyword(keyword);

  if (!normalized) return AMENITY_ICON_OPTIONS;

  return AMENITY_ICON_OPTIONS.filter((item) =>
    item.searchText.includes(normalized),
  );
};