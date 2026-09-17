package com.businessanalysis.businessanalysisai.repository;

import com.businessanalysis.businessanalysisai.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findAllByProjectIdOrderByGeneratedAtDesc(Long projectId);
    
    long countByProjectUserId(Long userId);
    
    Report findFirstByProjectUserIdOrderByGeneratedAtDesc(Long userId);

}
