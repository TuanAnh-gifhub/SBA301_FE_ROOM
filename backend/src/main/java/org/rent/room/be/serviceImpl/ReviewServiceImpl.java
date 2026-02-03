package org.rent.room.be.serviceImpl;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.dto.request.review.ReviewRequest;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public PageResponse<ReviewResponse> getReviews(int page, int size, String keyword, LocalDate from, LocalDate to) {
        return null;
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
        if(user != null){
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
