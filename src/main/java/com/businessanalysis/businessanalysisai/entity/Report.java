package com.businessanalysis.businessanalysisai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private Analysis analysis;

    @Column(nullable = false, length = 255)
    private String name;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] pdfContent;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] wordContent;

    @Column(nullable = false)
    private LocalDateTime generatedAt;

}
