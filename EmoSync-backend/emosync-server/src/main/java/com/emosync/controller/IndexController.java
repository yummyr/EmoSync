package com.emosync.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Home controller
 * Handles root path access and health check.
 * Provides:
 * - A friendly welcome page for the API service
 * - A simple health check endpoint
 */
@Controller
public class IndexController {

    /**
     * Root path welcome page.
     *
     * When visiting "/", this will render the index.html template
     * under src/main/resources/templates (or static, depending on your setup).
     *
     * @return view name "index"
     */
    @GetMapping("/")
    public String index() {
        // Return the view name (index.html template)
        return "index";
    }

    /**
     * Health check endpoint.
     *
     * @return simple text showing that the service is running
     */
    @GetMapping("/health")
    @ResponseBody
    public String health() {
        return "🎉 Service is running normally!";
    }
}
