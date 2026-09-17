package com.businessanalysis.businessanalysisai.service.impl;

import com.businessanalysis.businessanalysisai.dto.ProjectActivityResponse;
import com.businessanalysis.businessanalysisai.entity.ActivityAction;
import com.businessanalysis.businessanalysisai.entity.ActivityStatus;
import com.businessanalysis.businessanalysisai.entity.Project;
import com.businessanalysis.businessanalysisai.entity.ProjectActivity;
import com.businessanalysis.businessanalysisai.entity.User;
import com.businessanalysis.businessanalysisai.repository.ProjectActivityRepository;
import com.businessanalysis.businessanalysisai.repository.ProjectRepository;
import com.businessanalysis.businessanalysisai.repository.UserRepository;
import com.businessanalysis.businessanalysisai.service.ProjectActivityService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectActivityServiceImpl implements ProjectActivityService {

    private final ProjectActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional
    public void logActivityByProjectIdAndEmail(Long projectId, String userEmail, ActivityAction action, ActivityStatus status, String details) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found or not owned by user"));
        logActivity(project, user, action, status, details);
    }

    @Override
    @Transactional
    public void logActivity(Project project, User user, ActivityAction action, ActivityStatus status, String details) {
        ProjectActivity activity = ProjectActivity.builder()
                .project(project)
                .user(user)
                .action(action)
                .status(status)
                .details(details)
                .build();
        activityRepository.save(activity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectActivityResponse> getUserActivities(String userEmail, Long projectId, ActivityAction action, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Specification<ProjectActivity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Must belong to the user
            predicates.add(cb.equal(root.get("user").get("id"), user.getId()));
            
            if (projectId != null) {
                predicates.add(cb.equal(root.get("project").get("id"), projectId));
            }
            if (action != null) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), endDate));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return activityRepository.findAll(spec, pageable).map(this::mapToResponse);
    }
    
    private ProjectActivityResponse mapToResponse(ProjectActivity activity) {
        return ProjectActivityResponse.builder()
                .id(activity.getId())
                .projectId(activity.getProject().getId())
                .projectName(activity.getProject().getName())
                .userName(activity.getUser().getFullName() != null ? activity.getUser().getFullName() : activity.getUser().getEmail())
                .action(activity.getAction())
                .status(activity.getStatus())
                .details(activity.getDetails())
                .timestamp(activity.getTimestamp())
                .build();
    }
}
