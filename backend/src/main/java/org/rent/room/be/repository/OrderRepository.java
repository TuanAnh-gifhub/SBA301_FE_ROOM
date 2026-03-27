package org.rent.room.be.repository;

import org.rent.room.be.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByWallet_WalletId(UUID walletId);

    List<Order> findByRentPackage_RentPackageId(UUID packageId);
}