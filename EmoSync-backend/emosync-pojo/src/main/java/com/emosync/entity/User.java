package com.emosync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String email;

    private String phone;

    private String password;

    private String nickname;

    private String avatar;

    private Integer gender;

    private LocalDate birthday;

    @Column(name = "user_type")
    private Integer userType;

    private Integer status;

    // relations --------------

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<EmotionDiary> diaries;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<ConsultationSession> sessions;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<AiAnalysisTask> aiTasks;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<UserFavorite> favorites;

}
