package com.emosync.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Knife4j API Documentation Configuration Class

 * Used to configure Knife4j API documentation display and related resource access
 * Knife4j is an API documentation enhancement tool based on Swagger
 */
@Configuration
public class Knife4jConfig {

    /**
     * Configure OpenAPI object
     * Core configuration used to generate API documentation
     * Includes basic information, security configuration, etc.
     *
     * @return OpenAPI Returns the configured OpenAPI object
     */
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                // Configure API documentation basic information
                .info(this.getApiInfo());
    }

    /**
     * Get basic information configuration for API documentation
     * Configure metadata such as title, description, version of API documentation
     * Supports the following configuration items:
     * - Document title
     * - Document description
     * - Author information (currently commented out)
     * - License information (currently commented out)
     * - Terms of service (currently commented out)
     * - Version information
     *
     * @return Info Returns the API documentation basic information object
     */
    private Info getApiInfo() {
        return new Info()
                .title("EmoSync API Documentation")
                .description("Provides API interfaces")
                .version("1.0.0");
    }
}
