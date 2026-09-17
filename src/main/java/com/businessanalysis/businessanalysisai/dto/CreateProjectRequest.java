package com.businessanalysis.businessanalysisai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProjectRequest(
        @NotBlank(message = "Project name is required")
        @Size(max = 255, message = "Project name must not exceed 255 characters")
        String name,

        // Optional, as the user might rely solely on document uploads instead of typing an idea
        String businessIdea
) {}
