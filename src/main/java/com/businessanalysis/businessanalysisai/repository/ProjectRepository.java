package com.businessanalysis.businessanalysisai.repository;

import com.businessanalysis.businessanalysisai.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Retrieve all projects belonging to a specific user
    List<Project> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    // Retrieve a specific project ensuring it belongs to the requesting user
    Optional<Project> findByIdAndUserId(Long id, Long userId);
}
