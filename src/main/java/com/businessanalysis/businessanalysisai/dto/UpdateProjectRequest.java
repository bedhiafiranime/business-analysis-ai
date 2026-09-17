package com.businessanalysis.businessanalysisai.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProjectRequest(
        @NotBlank(message = "Project name is required")
        String name,
        String businessIdea
) {}
