package com.businessanalysis.businessanalysisai.mapper;

import com.businessanalysis.businessanalysisai.dto.DocumentResponse;
import com.businessanalysis.businessanalysisai.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DocumentMapper {

    @Mapping(source = "project.id", target = "projectId")
    DocumentResponse toResponse(Document document);
}
