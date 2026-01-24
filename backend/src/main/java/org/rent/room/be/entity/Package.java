package org.rent.room.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.rent.room.be.base.BaseEntity;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
@ToString(exclude = {"subscriptions","orders"})
@Entity
@Table(name = "packages")
public class Package extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "package_id")
    private UUID packageId;

    @Column(unique = true, name = "package_name", length = 50)
    private String packageName;

    private double price;

    @Column(name = "duration_days")
    private int durationDays;

    @OneToMany(mappedBy = "servicePackage", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Subscription> subscriptions;

    //servicePackage ten bien
    @OneToMany(mappedBy = "servicePackage", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Order> orders;
}
