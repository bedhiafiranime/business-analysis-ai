package com.businessanalysis.businessanalysisai.dto;

import com.businessanalysis.businessanalysisai.entity.AnalysisStatus;
import com.businessanalysis.businessanalysisai.entity.ProjectStatus;

import java.time.LocalDateTime;

public record AnalysisResponse(
        Long id,
        Long projectId,
        AnalysisStatus generationStatus,
        ProjectStatus projectStatus,
        String businessRequirements,
        String functionalRequirements,
        String nonFunctionalRequirements,
        String userStories,
        String acceptanceCriteria,
        String risks,
        String assumptions,
        String recommendations,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
