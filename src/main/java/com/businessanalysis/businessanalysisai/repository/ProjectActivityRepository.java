package com.businessanalysis.businessanalysisai.repository;

import com.businessanalysis.businessanalysisai.entity.ActivityAction;
import com.businessanalysis.businessanalysisai.entity.ProjectActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProjectActivityRepository extends JpaRepository<ProjectActivity, Long>, JpaSpecificationExecutor<ProjectActivity> {
    
    // We will use JpaSpecificationExecutor for filtering by user, project, action, date, but also add some basic ones if needed
    List<ProjectActivity> findByUserIdOrderByTimestampDesc(Long userId);
    
    Page<ProjectActivity> findByUserId(Long userId, Pageable pageable);
}
