package org.rent.room.be.entity;


import jakarta.persistence.*;
import lombok.*;
import org.rent.room.be.constant.RoomCopyStatus;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "room_copy")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RoomCopy {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "room_copy_id")
    private UUID roomCopyId;

    @Column(name = "room_code")
    private String roomCode;

    @Column(name = "room_copy_status")
    @Enumerated(EnumType.STRING)
    private RoomCopyStatus roomCopyStatus;

    @ManyToOne
    private Room room;

    @OneToMany(mappedBy = "roomCopy", fetch = FetchType.LAZY)
    private List<Slot> slots;
}
