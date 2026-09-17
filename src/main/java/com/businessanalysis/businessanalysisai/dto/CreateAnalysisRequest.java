package com.businessanalysis.businessanalysisai.dto;

import jakarta.validation.constraints.NotNull;

public record CreateAnalysisRequest(
        @NotNull(message = "Project ID is required")
        Long projectId,

        // Optional: If provided, the AI analyzes this specific uploaded document.
        // If null, the AI falls back to analyzing the project's text-based businessIdea.
        Long documentId,

        // Optional: Allows the client to request a specific model (e.g., "gpt-4o", "gemini-1.5-pro").
        // The service layer can provide a default if this is left blank.
        String aiModel
) {}
