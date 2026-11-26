package com.fieldex.storage.minio;

import com.fieldex.storage.FileStorageService;
import io.minio.*;
import io.minio.errors.MinioException;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioFileStorageService implements FileStorageService {

    private static final Path LOCAL_STORAGE_ROOT = Paths.get(System.getProperty("java.io.tmpdir"), "field-ex-docs");

    private final MinioClient minioClient;
    private final MinioProperties properties;
    private volatile boolean minioAvailable = false;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(LOCAL_STORAGE_ROOT);
        } catch (IOException ex) {
            log.warn("Could not initialize local fallback storage directory {}: {}", LOCAL_STORAGE_ROOT, ex.getMessage());
        }
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(properties.getBucketName()).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(properties.getBucketName()).build());
                log.info("Created MinIO bucket: {}", properties.getBucketName());
            } else {
                log.info("Connected to MinIO bucket: {}", properties.getBucketName());
            }
            minioAvailable = true;
        } catch (Exception e) {
            minioAvailable = false;
            log.warn("MinIO service not reachable at {} (bucket: {}). Using local filesystem fallback at {}.",
                    properties.getUrl(), properties.getBucketName(), LOCAL_STORAGE_ROOT);
        }
    }

    @Override
    public void upload(String key, InputStream inputStream, String contentType, long size) {
        try {
            byte[] bytes = inputStream.readAllBytes();
            if (minioAvailable) {
                try {
                    minioClient.putObject(
                            PutObjectArgs.builder()
                                    .bucket(properties.getBucketName())
                                    .object(key)
                                    .stream(new ByteArrayInputStream(bytes), bytes.length, -1)
                                    .contentType(contentType)
                                    .build());
                    return;
                } catch (Exception e) {
                    minioAvailable = false;
                    log.warn("MinIO upload failed ({}), falling back to local document storage.", e.getMessage());
                }
            }
            Path target = resolveLocalPath(key);
            Files.createDirectories(target.getParent());
            Files.write(target, bytes);
        } catch (Exception e) {
            throw new RuntimeException("Error storing file: " + key, e);
        }
    }

    @Override
    public InputStream download(String key) {
        if (minioAvailable) {
            try {
                return minioClient.getObject(
                        GetObjectArgs.builder()
                                .bucket(properties.getBucketName())
                                .object(key)
                                .build());
            } catch (Exception e) {
                log.warn("MinIO download failed ({}), trying local fallback.", e.getMessage());
            }
        }
        try {
            Path target = resolveLocalPath(key);
            if (!Files.exists(target)) {
                throw new RuntimeException("Document file not found in storage: " + key);
            }
            return Files.newInputStream(target);
        } catch (IOException e) {
            throw new RuntimeException("Error reading local file: " + key, e);
        }
    }

    @Override
    public void delete(String key) {
        if (minioAvailable) {
            try {
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(properties.getBucketName())
                                .object(key)
                                .build());
            } catch (Exception e) {
                log.warn("MinIO delete skipped: {}", e.getMessage());
            }
        }
        try {
            Files.deleteIfExists(resolveLocalPath(key));
        } catch (IOException e) {
            log.warn("Local file delete failed for {}: {}", key, e.getMessage());
        }
    }

    @Override
    public String getPresignedUrl(String key, int expirySeconds) {
        if (minioAvailable) {
            try {
                return minioClient.getPresignedObjectUrl(
                        GetPresignedObjectUrlArgs.builder()
                                .method(Method.GET)
                                .bucket(properties.getBucketName())
                                .object(key)
                                .expiry(expirySeconds, TimeUnit.SECONDS)
                                .build());
            } catch (Exception e) {
                minioAvailable = false;
                log.warn("MinIO presigned URL unavailable ({}), returning local download indicator.", e.getMessage());
            }
        }
        return "local://" + key;
    }

    private Path resolveLocalPath(String key) {
        String normalized = key.replace("\\", "/").replaceAll("^/+", "");
        Path resolved = LOCAL_STORAGE_ROOT.resolve(normalized).normalize();
        if (!resolved.startsWith(LOCAL_STORAGE_ROOT)) {
            throw new IllegalArgumentException("Invalid storage key path");
        }
        return resolved;
    }
}
