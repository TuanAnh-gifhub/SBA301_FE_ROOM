package org.rent.room.be.repository;

import org.rent.room.be.entity.Notification;
import org.rent.room.be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository <Notification, UUID>{
    Page<Notification> findAllByRecipient(User recipient, Pageable pageable);}
