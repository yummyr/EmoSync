package com.emosync.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Simple file information")
public class SimpleFileInfoDTO {
    @Schema(description = "File name")
    private String filename;
    @Schema(description = "File size")
    private long size;
    @Schema(description = "Last modified")
    private long lastModified;
    @Schema(description = "File path")
    private String path;

}
