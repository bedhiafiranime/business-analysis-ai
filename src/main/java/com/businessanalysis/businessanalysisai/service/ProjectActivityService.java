package com.businessanalysis.businessanalysisai.service;

import com.businessanalysis.businessanalysisai.dto.ProjectActivityResponse;
import com.businessanalysis.businessanalysisai.entity.ActivityAction;
import com.businessanalysis.businessanalysisai.entity.ActivityStatus;
import com.businessanalysis.businessanalysisai.entity.Project;
import com.businessanalysis.businessanalysisai.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface ProjectActivityService {
    
    void logActivity(Project project, User user, ActivityAction action, ActivityStatus status, String details);
    
    void logActivityByProjectIdAndEmail(Long projectId, String userEmail, ActivityAction action, ActivityStatus status, String details);
    
    Page<ProjectActivityResponse> getUserActivities(String userEmail, Long projectId, ActivityAction action, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
