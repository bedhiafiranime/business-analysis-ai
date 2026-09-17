package com.businessanalysis.businessanalysisai.mapper;

import com.businessanalysis.businessanalysisai.dto.CreateProjectRequest;
import com.businessanalysis.businessanalysisai.dto.ProjectResponse;
import com.businessanalysis.businessanalysisai.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProjectMapper {

    ProjectResponse toResponse(Project project);

    Project toEntity(CreateProjectRequest request);
}
