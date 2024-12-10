package com.example.apkproyecto.network;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.util.Map;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {
    private static Retrofit retrofit;
    private static String BASE_URL;

    public static Retrofit getInstance() {
        if (retrofit == null) {
            BASE_URL = getBackendCatalogUrl();
            if (BASE_URL == null) {
                System.err.println("No se pudo cargar la URL del archivo JSON.");
                return null;
            }

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }

    private static String getBackendCatalogUrl() {
        try {
            // Ruta al archivo links.json
            File file = new File("C:/Users/Tobal/Desktop/Proyecto-Dis-U3-main/ueats-web/src/assets/links.json");

            // Cargar el archivo JSON en un Map
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Map<String, String>> jsonMap = mapper.readValue(file, Map.class);

            // Obtener la URL del backend-catalog
            return jsonMap.get("urls").get("fronted");
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
