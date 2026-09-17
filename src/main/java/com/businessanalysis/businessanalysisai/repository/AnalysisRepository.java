package com.businessanalysis.businessanalysisai.repository;

import com.businessanalysis.businessanalysisai.entity.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisRepository extends JpaRepository<Analysis, Long> {

    // Retrieve all analyses for a specific project, ordered by newest first
    List<Analysis> findAllByProjectIdOrderByGeneratedAtDesc(Long projectId);

    // Retrieve the most recent analysis for a specific project
    Optional<Analysis> findFirstByProjectIdOrderByGeneratedAtDesc(Long projectId);

    // Count all analyses for a user with a specific status
    long countByProjectUserIdAndGenerationStatus(Long userId, com.businessanalysis.businessanalysisai.entity.AnalysisStatus status);
}
