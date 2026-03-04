package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.rent.room.be.base.BaseEntity;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "commission_configs")
public class CommissionConfig extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "commission_config_id")
    private UUID commissionConfigId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", unique = true)
    private User owner;

    /**
     * Tỉ lệ hoa hồng, ví dụ:
     * 0.1000 = 10% | 0.0500 = 5% | 0.1500 = 15%
     */
    @Column(name = "rate", precision = 5, scale = 4, nullable = false)
    private BigDecimal rate;

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;
}

