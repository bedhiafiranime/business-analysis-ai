package com.businessanalysis.businessanalysisai.dto;

import com.businessanalysis.businessanalysisai.entity.ProjectStatus;

import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        String name,
        String businessIdea,
        ProjectStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean isArchived,
        boolean isFavorite
) {}
