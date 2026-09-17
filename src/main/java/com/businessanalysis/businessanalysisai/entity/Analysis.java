package com.businessanalysis.businessanalysisai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(columnDefinition = "TEXT")
    private String businessRequirements;

    @Column(columnDefinition = "TEXT")
    private String functionalRequirements;

    @Column(columnDefinition = "TEXT")
    private String nonFunctionalRequirements;

    @Column(columnDefinition = "TEXT")
    private String userStories;

    @Column(columnDefinition = "TEXT")
    private String acceptanceCriteria;

    @Column(columnDefinition = "TEXT")
    private String risks;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(length = 100)
    private String aiModel;

    @Column(columnDefinition = "TEXT")
    private String assumptions;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    @Builder.Default
    private AnalysisStatus generationStatus = AnalysisStatus.PENDING;

    private LocalDateTime generatedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
