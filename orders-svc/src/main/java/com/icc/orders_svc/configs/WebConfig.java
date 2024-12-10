package com.icc.orders_svc.configs;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String backendCatalogUrl = getBackendCatalogUrl();

        if (backendCatalogUrl != null) {
            System.out.println("URL para backend-orders cargada: " + backendCatalogUrl);

            registry.addMapping("/**")
                    .allowedOrigins(backendCatalogUrl)
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*");
        } else {
            System.err.println("No se pudo cargar la URL de backend-orders desde el archivo links.json.");
        }
    }

    private String getBackendCatalogUrl() {
        try {
            String userHome = System.getProperty("user.home");

            Path filePath = Paths.get(userHome, "Desktop", "Proyecto-Dis-U3-main",
                    "ueats-web", "src", "assets", "links.json");
            File file = filePath.toFile();

            if (!file.exists()) {
                System.err.println("El archivo links.json no existe en la ruta: " + filePath);
                return null;
            }

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Map<String, String>> jsonMap = mapper.readValue(file, Map.class);

            String frontendUrl = jsonMap.get("urls").get("fronted");

            if (frontendUrl == null || frontendUrl.isEmpty()) {
                System.err.println("La URL del frontend no está disponible en el archivo JSON");
                return null;
            }

            return frontendUrl;

        } catch (IOException e) {
            System.err.println("Error al leer el archivo links.json: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}