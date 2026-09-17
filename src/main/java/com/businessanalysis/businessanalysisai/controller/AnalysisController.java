package com.businessanalysis.businessanalysisai.controller;

import com.businessanalysis.businessanalysisai.dto.AnalysisResponse;
import com.businessanalysis.businessanalysisai.dto.CreateAnalysisRequest;
import com.businessanalysis.businessanalysisai.service.AnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/analyses")
    public ResponseEntity<AnalysisResponse> createAnalysis(
            @Valid @RequestBody CreateAnalysisRequest request,
            Authentication authentication) {
        AnalysisResponse response = analysisService.createAnalysis(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/analyses/{id}")
    public ResponseEntity<AnalysisResponse> getAnalysis(
            @PathVariable Long id,
            Authentication authentication) {
        AnalysisResponse response = analysisService.getAnalysis(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/projects/{projectId}/analyses")
    public ResponseEntity<List<AnalysisResponse>> getProjectAnalyses(
            @PathVariable Long projectId,
            Authentication authentication) {
        List<AnalysisResponse> responses = analysisService.getProjectAnalyses(projectId, authentication.getName());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/projects/{projectId}/analyses/latest")
    public ResponseEntity<AnalysisResponse> getLatestAnalysis(
            @PathVariable Long projectId,
            Authentication authentication) {
        AnalysisResponse response = analysisService.getLatestAnalysis(projectId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analyses/count")
    public ResponseEntity<Long> getCompletedAnalysesCount(Authentication authentication) {
        long count = analysisService.countCompletedAnalyses(authentication.getName());
        return ResponseEntity.ok(count);
    }
}
