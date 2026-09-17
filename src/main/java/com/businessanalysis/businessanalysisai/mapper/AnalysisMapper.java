package com.businessanalysis.businessanalysisai.mapper;

import com.businessanalysis.businessanalysisai.dto.AnalysisResponse;
import com.businessanalysis.businessanalysisai.dto.CreateAnalysisRequest;
import com.businessanalysis.businessanalysisai.entity.Analysis;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AnalysisMapper {

    @Mapping(source = "project.id", target = "projectId")
    AnalysisResponse toResponse(Analysis analysis);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "businessRequirements", ignore = true)
    @Mapping(target = "functionalRequirements", ignore = true)
    @Mapping(target = "nonFunctionalRequirements", ignore = true)
    @Mapping(target = "userStories", ignore = true)
    @Mapping(target = "acceptanceCriteria", ignore = true)
    @Mapping(target = "risks", ignore = true)
    @Mapping(target = "recommendations", ignore = true)
    @Mapping(target = "generationStatus", ignore = true)
    @Mapping(target = "generatedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Analysis toEntity(CreateAnalysisRequest request);
}
