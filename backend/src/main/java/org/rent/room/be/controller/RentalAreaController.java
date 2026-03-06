package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.BookingStatus;

import org.rent.room.be.dto.request.rental_area.CreateRentalAreaRequest;
import org.rent.room.be.dto.request.rental_area.UpdateRentalAreaRequest;
import org.rent.room.be.dto.request.rental_area.UpdateRentalAreaStatusRequest;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;
import org.rent.room.be.security.CustomUserDetails;
import org.rent.room.be.service.RentalAreaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


@RestController
@RequiredArgsConstructor
@RequestMapping("/rental-areas")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "4. Rental Area")
public class RentalAreaController {

    RentalAreaService rentalAreaService;

    @GetMapping("/{rentalAreaId}/bookings")
    public ApiResponse<?> getBookingsByRentalAreaId(
            @PathVariable UUID rentalAreaId,
            @RequestParam(required = false) BookingStatus bookingStatus,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDate toDate,
            @RequestParam(defaultValue = "1", required = false) int page,
            @RequestParam(defaultValue = "10", required = false) int size
    ) {
        PageResponse<?> result = rentalAreaService.getBookingsByRentalAreaId(
                rentalAreaId, bookingStatus, fromDate, toDate, page, size
        );

        return ApiResponse.success(200, "Get bookings by rental area id successfully", result);
    }
//    @GetMapping("/{rentalAreaId}/bookings/statistics")
//    public ApiResponse<?> getBookingStatisticsByRentalAreaId(){
//
//        return null;
//    }

//    @GetMapping("/{rentalAreaId}/bookings/report")



    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RentalAreaResponse>> createRentalArea(
            @Valid @ModelAttribute CreateRentalAreaRequest request,
            @RequestPart("images") MultipartFile[] images,
            @AuthenticationPrincipal UserDetails principal
    ) {

        UUID currentUserId = null;

        if (principal instanceof CustomUserDetails customUserDetails) {
            currentUserId = customUserDetails.getUserId();
        }

        if (currentUserId == null) {
            throw new RuntimeException("User not authenticated");
        }

        System.out.println("images length = " + (images == null ? 0 : images.length));
        System.out.println("cityId = " + request.getCityId());

        RentalAreaResponse result =
                rentalAreaService.createRentalArea(request, List.of(images), currentUserId);

        ApiResponse<RentalAreaResponse> response = ApiResponse.<RentalAreaResponse>builder()
                .code(200)
                .message("Create rental area successfully")
                .result(result)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ApiResponse<?> getAllRentalAreas(
            @RequestParam(required = false) String address,
            @RequestParam(required = false)String renterAreaName,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDate toDate,
            @RequestParam(defaultValue = "1", required = false) int page,
            @RequestParam(defaultValue = "10", required = false) int size
    ) {
        PageResponse<RentalAreaResponse> result = rentalAreaService.getAllRentalAreas(page,size,address,renterAreaName,fromDate,toDate);


        return ApiResponse.success(200,"Get all rental areas successfully", result);
    }

    @GetMapping("/my-rental-areas")
    public ResponseEntity<ApiResponse<List<RentalAreaResponse>>> getMyRentalAreas(
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID currentUserId = null;
        if (principal instanceof CustomUserDetails customUserDetails) {
            currentUserId = customUserDetails.getUserId();
        }
        if (currentUserId == null) {
            throw new RuntimeException("User not authenticated");
        }

        List<RentalAreaResponse> result = rentalAreaService.getRentalAreasByUserId(currentUserId);
        ApiResponse<List<RentalAreaResponse>> response = ApiResponse.<List<RentalAreaResponse>>builder()
                .code(200)
                .message("Get user rental areas successfully")
                .result(result)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{rentalAreaId}")
    public ResponseEntity<ApiResponse<RentalAreaResponse>> getRentalAreaById(
            @PathVariable UUID rentalAreaId
    ) {
        RentalAreaResponse result = rentalAreaService.getRentalAreaById(rentalAreaId);
        ApiResponse<RentalAreaResponse> response = ApiResponse.<RentalAreaResponse>builder()
                .code(200)
                .message("Get rental area successfully")
                .result(result)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{rentalAreaId}")
    public ResponseEntity<ApiResponse<Void>> deleteRentalArea(
            @PathVariable UUID rentalAreaId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID currentUserId = null;
        String currentUserRole = null;

        if (principal instanceof CustomUserDetails customUserDetails) {
            currentUserId = customUserDetails.getUserId();
            currentUserRole = customUserDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse(null);
        }

        if (currentUserId == null) {
            throw new RuntimeException("User not authenticated");
        }

        rentalAreaService.deleteRentalArea(rentalAreaId, currentUserId, currentUserRole);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(200)
                .message("Delete rental area successfully")
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{rentalAreaId}")
    public ResponseEntity<ApiResponse<RentalAreaResponse>> updateRentalArea(
            @PathVariable UUID rentalAreaId,
            @Valid @RequestBody UpdateRentalAreaRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID currentUserId = null;
        String currentUserRole = null;

        if (principal instanceof CustomUserDetails customUserDetails) {
            currentUserId = customUserDetails.getUserId();
            currentUserRole = customUserDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse(null);
        }
        if (currentUserId == null) throw new RuntimeException("User not authenticated");

        RentalAreaResponse result = rentalAreaService.updateRentalArea(
                rentalAreaId, request, currentUserId, currentUserRole
        );

        return ResponseEntity.ok(ApiResponse.<RentalAreaResponse>builder()
                .code(200)
                .message("Update rental area successfully")
                .result(result)
                .build());
    }

    @PatchMapping("/{rentalAreaId}/status")
    public ResponseEntity<ApiResponse<RentalAreaResponse>> updateRentalAreaStatus(
            @PathVariable UUID rentalAreaId,
            @Valid @RequestBody UpdateRentalAreaStatusRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID currentUserId = null;
        String currentUserRole = null;

        if (principal instanceof CustomUserDetails customUserDetails) {
            currentUserId = customUserDetails.getUserId();
            currentUserRole = customUserDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse(null);
        }
        if (currentUserId == null) throw new RuntimeException("User not authenticated");

        RentalAreaResponse result = rentalAreaService.updateRentalAreaStatus(
                rentalAreaId, request, currentUserId, currentUserRole
        );

        return ResponseEntity.ok(ApiResponse.<RentalAreaResponse>builder()
                .code(200)
                .message("Update rental area status successfully")
                .result(result)
                .build());
    }
}

