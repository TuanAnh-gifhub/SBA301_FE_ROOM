const STORAGE_KEY = "booking_intent";

export function saveBookingIntent(data: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getBookingIntent() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearBookingIntent() {
  localStorage.removeItem(STORAGE_KEY);
}
