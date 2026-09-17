package com.businessanalysis.businessanalysisai.repository;

import com.businessanalysis.businessanalysisai.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    // Retrieve all documents belonging to a specific project
    List<Document> findAllByProjectId(Long projectId);

    // Retrieve a specific document ensuring it belongs to the correct project
    Optional<Document> findByIdAndProjectId(Long id, Long projectId);
}
