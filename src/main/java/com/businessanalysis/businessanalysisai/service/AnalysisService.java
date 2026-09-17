package com.businessanalysis.businessanalysisai.service;

import com.businessanalysis.businessanalysisai.dto.AnalysisResponse;
import com.businessanalysis.businessanalysisai.dto.CreateAnalysisRequest;

import java.util.List;

public interface AnalysisService {

    /**
     * Triggers a new AI analysis for a specific project based on the request payload.
     * The userEmail ensures the requesting user owns the project.
     */
    AnalysisResponse createAnalysis(CreateAnalysisRequest request, String userEmail);

    /**
     * Retrieves a specific analysis iteration.
     * The userEmail ensures the requesting user owns the parent project.
     */
    AnalysisResponse getAnalysis(Long analysisId, String userEmail);

    /**
     * Retrieves the most recently generated analysis for a given project.
     */
    AnalysisResponse getLatestAnalysis(Long projectId, String userEmail);

    /**
     * Retrieves the full history of analyses performed on a specific project.
     */
    List<AnalysisResponse> getProjectAnalyses(Long projectId, String userEmail);

    /**
     * Retrieves the total count of completed analyses across all projects for a user.
     */
    long countCompletedAnalyses(String userEmail);
}
