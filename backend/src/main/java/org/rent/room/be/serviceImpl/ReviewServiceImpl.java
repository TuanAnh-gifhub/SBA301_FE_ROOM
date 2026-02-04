package org.rent.room.be.serviceImpl;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.dto.request.review.ReviewRequest;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;
import org.rent.room.be.dto.response.review.ReviewResponse;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.RentalArea;
import org.rent.room.be.entity.Review;
import org.rent.room.be.entity.User;
import org.rent.room.be.mapper.ReviewMapper;
import org.rent.room.be.repository.BookingRepository;
import org.rent.room.be.repository.RentalAreaRepository;
import org.rent.room.be.repository.ReviewRepository;
import org.rent.room.be.repository.UserRepository;
import org.rent.room.be.service.ReviewService;
import org.rent.room.be.service.UserService;
import org.rent.room.be.specification.ReviewSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewServiceImpl implements ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private ReviewMapper reviewMapper;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private RentalAreaRepository rentalAreaRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Override
    public PageResponse<ReviewResponse> getReviews(int page, int size, String comment, Integer rating, LocalDate startDate, LocalDate endDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Review> spec = ReviewSpecification.filterReviews(comment, rating, startDate, endDate);
        Page<Review> reviews = reviewRepository.findAll(spec, pageable);
        List<ReviewResponse> reviewResponseList = reviews.getContent().stream().map(
                        review -> {

                            User user = review.getUser();
                            RentalArea rentalArea = review.getRental();
                            RentalAreaResponse rentalAreaResponse = RentalAreaResponse.builder()
                                    .rentalAreaId(rentalArea.getRentalAreaId())
                                    .address(rentalArea.getAddress())
                                    .rentalAreaName(rentalArea.getRentalAreaName())
                                    .build();
                            return ReviewResponse.builder()
                                    .reviewId(review.getReviewId())
                                    .userId(user.getUserId())
                                    .userName(user.getUserName())
                                    .bookingId(review.getBooking().getBookingId())
                                    .rating(review.getRating())
                                    .comment(review.getComment())
                                    .rentalArea(rentalAreaResponse)
                                    .build();
                        }
                )
                .toList();

        return PageResponse.<ReviewResponse>builder()
                .currentPage(reviews.getNumber() + 1)
                .totalPages(reviews.getTotalPages())
                .pageSize(reviews.getSize())
                .totalElements(reviews.getTotalElements())
                .data(reviewResponseList)
                .build();
    }

    @Override
    public ReviewResponse create(ReviewRequest request) {

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("booking not found"));

        RentalArea rentalArea = rentalAreaRepository.findById(booking.getRentalArea().getRentalAreaId())
                .orElseThrow(() -> new RuntimeException("rental area not found"));

        User user = userService.getCurrentUserEntity();

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .booking(booking)
                .user(user)
                .rental(rentalArea)
                .build();

        reviewRepository.save(review);

        return reviewMapper.toResponse(review);
    }

    @Override
    public void update(UUID reviewId, ReviewRequest request) {
        User user = userService.getCurrentUserEntity();
        if (user != null) {
            Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new RuntimeException("review not found"));
            review.setRating(request.getRating());
            review.setComment(request.getComment());
            review.setUpdatedAt(LocalDateTime.now());
            reviewRepository.save(review);
        }

    }

    @Override
    public ReviewResponse getReviewById(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review != null) {
            return reviewMapper.toResponse(review);
        }
        return null;
    }

    @Override
    public void delete(UUID id) {
        User user = userService.getCurrentUserEntity();
        if (user != null) {
            reviewRepository.deleteById(id);
        }

    }
}
