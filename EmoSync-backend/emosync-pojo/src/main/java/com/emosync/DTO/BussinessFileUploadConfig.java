package com.emosync.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
@Schema(description = "Business file configuration DTO")
@Data
@AllArgsConstructor
public class BussinessFileUploadConfig {
  @Schema(description = "Business file type")
  String  businessType;
  @Schema(description = "Business file description")
  String  businessDesc;
  @Schema(description = "Allowed types")
  List<String> allowedTypes;
  @Schema(description = "Maximum file size")
  Long  maxFileSize;
  @Schema(description = "Allowed extensions")
  List<String> allowedExtensions;
}
