package com.businessanalysis.businessanalysisai.controller;

import com.businessanalysis.businessanalysisai.dto.ProjectActivityResponse;
import com.businessanalysis.businessanalysisai.dto.LogActivityRequest;
import com.businessanalysis.businessanalysisai.entity.ActivityAction;
import com.businessanalysis.businessanalysisai.service.ProjectActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/history")
@RequiredArgsConstructor
public class HistoryController {

    private final ProjectActivityService activityService;

    @GetMapping
    public ResponseEntity<Page<ProjectActivityResponse>> getUserHistory(
            Authentication authentication,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) ActivityAction action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<ProjectActivityResponse> activities = activityService.getUserActivities(
                authentication.getName(), projectId, action, startDate, endDate, pageable);
                
        return ResponseEntity.ok(activities);
    }

    @PostMapping("/log")
    public ResponseEntity<Void> logActivity(
            Authentication authentication,
            @RequestBody LogActivityRequest request) {
        activityService.logActivityByProjectIdAndEmail(
                request.getProjectId(),
                authentication.getName(),
                request.getAction(),
                request.getStatus(),
                request.getDetails()
        );
        return ResponseEntity.ok().build();
    }
}
