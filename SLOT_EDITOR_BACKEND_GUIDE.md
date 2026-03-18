# Hướng dẫn Backend - Luồng Chỉnh sửa Slot cho Owner

## Overview

Hệ thống cần 3 API endpoint để hỗ trợ chỉnh sửa slot (thời gian thuê) phòng cho Owner:

1. **Check Conflict** - Kiểm tra xung đột slot khi extend thời gian
2. **Get Available Slots** - Lấy danh sách slot khả dụng để swap
3. **Update Booking Slot** - Cập nhật slot mới

---

## 1. Check Slot Conflict API

### Endpoint

```
GET /api/v1/bookings/check-conflict
```

### Parameters (Query)

```json
{
  "roomId": "room_123",
  "startTime": "2026-03-20 14:00:00",
  "endTime": "2026-03-20 18:00:00",
  "excludeBookingId": "booking_456" (optional - để exclude booking hiện tại)
}
```

### Response

```json
{
  "code": "200",
  "message": "Success",
  "result": [
    {
      "bookingId": "booking_789",
      "userName": "Nguyen Van A",
      "startTime": "2026-03-20 16:00:00",
      "endTime": "2026-03-20 18:30:00",
      "status": "BOOKED"
    }
  ]
}
```

### Logic

- Tìm tất cả slot của phòng (roomId) lập giao với thời gian mới
- Exclude booking hiện tại (nếu có excludeBookingId)
- Trả về danh sách các booking bị xung đột
- Nếu không có conflict → trả về array rỗng

### SQL Tham khảo

```sql
SELECT b.booking_id as bookingId,
       b.user_name as userName,
       s.start_time as startTime,
       s.end_time as endTime,
       b.status
FROM bookings b
JOIN slots s ON b.booking_id = s.booking_id
WHERE s.room_id = ?
  AND s.booking_id != COALESCE(?, '')
  AND (
    (s.start_time < ? AND s.end_time > ?)  -- Overlap check
  )
  AND b.status IN ('BOOKED', 'CONFIRMED')
```

---

## 2. Get Available Slots API

### Endpoint

```
GET /api/v1/bookings/available-slots
```

### Parameters (Query)

```json
{
  "roomId": "room_123",
  "startTime": "2026-03-20",
  "duration": 4
}
```

### Response

```json
{
  "code": "200",
  "message": "Success",
  "result": [
    {
      "slotId": "slot_001",
      "roomId": "room_123",
      "roomCode": "P101",
      "startTime": "2026-03-20 10:00:00",
      "endTime": "2026-03-20 14:00:00",
      "duration": 4
    },
    {
      "slotId": "slot_002",
      "roomId": "room_123",
      "roomCode": "P101",
      "startTime": "2026-03-20 18:30:00",
      "endTime": "2026-03-20 22:30:00",
      "duration": 4
    }
  ]
}
```

### Logic

- Tìm tất cả khoảng thời gian khả dụng trong ngày cho phòng
- Các khoảng thời gian phải có độ dài >= duration (giờ)
- Exclude các slot đã được booking (BOOKED, CONFIRMED status)
- Sắp xếp theo thời gian

### SQL Tham khảo

```sql
-- Lấy tất cả booking trong ngày
SELECT s.start_time, s.end_time
FROM slots s
JOIN bookings b ON s.booking_id = b.booking_id
WHERE s.room_id = ?
  AND DATE(s.start_time) = ?
  AND b.status IN ('BOOKED', 'CONFIRMED')
ORDER BY s.start_time

-- Sau đó tính toán gap giữa các booking
-- Ví dụ: nếu có booking 10:00-12:00 và 14:00-16:00
-- Thì slot khả dụng là: 00:00-10:00, 12:00-14:00, 16:00-23:59 (tùy giờ mở)
```

---

## 3. Update Booking Slot API

### Endpoint

```
PUT /api/v1/bookings/{bookingId}/slots
```

### Request Body

```json
{
  "slotId": "slot_456",
  "bookingId": "booking_123",
  "startTime": "2026-03-20 10:00:00",
  "endTime": "2026-03-20 14:00:00"
}
```

### Response

```json
{
  "code": "200",
  "message": "Cập nhật slot thành công",
  "result": {
    "bookingId": "booking_123",
    "slotId": "slot_456",
    "startTime": "2026-03-20 10:00:00",
    "endTime": "2026-03-20 14:00:00",
    "totalPrice": 400000
  }
}
```

### Logic & Transaction

1. **Validate:**
   - Booking phải tồn tại và trạng thái BOOKED
   - Slot phải thuộc booking
   - startTime < endTime
   - Không được extend quá 24 giờ
2. **Check Conflict:**
   - Kiểm tra xung đột slot trong phòng (không overlap)
   - Nếu có conflict → throw Exception

3. **Update Slot:**
   - Cập nhật start_time, end_time
   - Tính lại totalPrice dựa trên giá phòng × số giờ mới
   - Cập nhật lại booking.totalPrice (sum tất cả slots)

   ```sql
   UPDATE slots
   SET start_time = ?,
       end_time = ?,
       price = (TIMEDIFF(?, ?) / 3600 * hourly_rate)
   WHERE slot_id = ?

   UPDATE bookings
   SET total_price = (SUM của tất cả slot trong booking)
   WHERE booking_id = ?
   ```

4. **Rollback Mechanism:**
   - Nếu lỗi ở bước nào → rollback tất cả
   - Không update partial

---

## Database Schema Changes (if needed)

```sql
-- Có thể thêm column vào table slots
ALTER TABLE slots ADD COLUMN is_extended BOOLEAN DEFAULT FALSE;
ALTER TABLE slots ADD COLUMN original_end_time DATETIME NULL;
ALTER TABLE slot_audit ADD COLUMN action_type VARCHAR(50); -- EXTEND, SWAP, etc.
```

---

## Error Handling

### Possible Errors

| Error                 | HTTP Code | Message                                       |
| --------------------- | --------- | --------------------------------------------- |
| Booking not found     | 404       | "Không tìm thấy booking"                      |
| Slot not found        | 404       | "Slot không tồn tại"                          |
| Slot conflict         | 409       | "Thời gian này bị xung đột với booking khác"  |
| Invalid time range    | 400       | "Thời gian kết thúc phải sau bắt đầu"         |
| Max duration exceeded | 400       | "Không được extend quá 24 giờ"                |
| Booking not editable  | 400       | "Booking không ở trạng thái có thể chỉnh sửa" |
| Unauthorized          | 403       | "Bạn không có quyền chỉnh sửa booking này"    |

---

## Implementation Notes

### Thread Safety / Concurrent Update

**Problem:** Nếu 2 owner cùng edit slot → có thể gây duplicate/overlap

**Solution:** Sử dụng **Pessimistic Locking** hoặc **Optimistic Locking**

#### Option 1: Pessimistic Locking

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT s FROM Slot s WHERE s.id = :slotId")
Slot findByIdForUpdate(@Param("slotId") String slotId);
```

#### Option 2: Optimistic Locking (Version)

```java
@Entity
public class Slot {
    @Version
    private Long version;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
```

#### Option 3: Database-level Constraint

```sql
-- Unique constraint để ngăn overlap
ALTER TABLE slots
ADD CONSTRAINT unique_room_time_overlap
CHECK (NOT EXISTS (
    SELECT 1 FROM slots s2
    WHERE s2.room_id = slots.room_id
    AND s2.slot_id != slots.slot_id
    AND s2.start_time < slots.end_time
    AND s2.end_time > slots.start_time
    AND s2.booking_id IN (SELECT booking_id FROM bookings WHERE status IN ('BOOKED', 'CONFIRMED'))
))
```

---

## Price Recalculation Logic

```
newTotalPrice = sum của tất cả slots

Mỗi slot:
  hourlyRate = room.hourlyPrice (từ trong Slot hoặc từ Room)
  durationHours = TIMEDIFF(slot.endTime, slot.startTime) / 3600
  slotPrice = hourlyRate * durationHours
```

---

## Testing Scenarios

1. **Extend slot:** 14:00 → 18:00 → 20:00 (thêm 2 giờ)
2. **Swap slot:** Đổi sang phòng khác nếu phòng hiện tại không có slot khả dụng
3. **Conflict detection:** Extend vào khoảng đã được booking → show conflict list
4. **Multiple slots:** Nếu booking có nhiều room → update từng room riêng
5. **Price update:** Verify totalPrice được recalculate chính xác

---

## Status Transition Rules

```
BOOKED ────(Extend/Swap)────> BOOKED (với update timestamp)
           (Conflict Found)    → Error, không update

COMPLETED ──(No Edit)──────> Không cho phép chỉnh sửa
CANCELLED ──(No Edit)──────> Không cho phép chỉnh sửa
```

---

## Example Implementation Skeleton (Java/Spring)

```java
@RestController
@RequestMapping("/api/v1/bookings")
public class BookingSlotController {

    @GetMapping("/check-conflict")
    public ApiResponse<List<BookingConflictResponse>> checkConflict(
        @RequestParam String roomId,
        @RequestParam String startTime,
        @RequestParam String endTime,
        @RequestParam(required = false) String excludeBookingId
    ) {
        // Validate params
        // Query conflicting bookings
        // Return result
    }

    @GetMapping("/available-slots")
    public ApiResponse<List<AvailableSlotResponse>> getAvailableSlots(
        @RequestParam String roomId,
        @RequestParam String startTime,
        @RequestParam Integer duration
    ) {
        // Parse date
        // Find booked slots
        // Calculate gaps
        // Return available slots
    }

    @PutMapping("/{bookingId}/slots")
    public ApiResponse<UpdateSlotResponse> updateSlot(
        @PathVariable String bookingId,
        @RequestBody UpdateSlotRequest request
    ) {
        // Validate booking ownership (Authorization)
        // Check for conflicts
        // Update slot
        // Recalculate prices
        // Return success
    }
}
```

---

## Summary

| Thành phần              | Chi tiết                                               |
| ----------------------- | ------------------------------------------------------ |
| **API Endpoints**       | 3 endpoints (check-conflict, available-slots, update)  |
| **Locking Strategy**    | Pessimistic/Optimistic locking để avoid race condition |
| **Price Recalculation** | Tự động tính lại dựa trên duration mới                 |
| **Conflict Detection**  | Kiểm tra overlap time trước update                     |
| **Error Handling**      | 409 Conflict, 400 Invalid, 403 Unauthorized            |
| **Validation**          | Time range, ownership, booking status                  |
