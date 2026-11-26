package com.fieldex.coldchain;

import com.fieldex.batch.FruitBatch;
import com.fieldex.batch.FruitBatchRepository;
import com.fieldex.coldchain.dto.ColdChainEventDto;
import com.fieldex.coldchain.dto.TemperatureReadingDto;
import jakarta.persistence.EntityNotFoundException;
import com.fieldex.warehouse.Warehouse;
import com.fieldex.warehouse.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ColdChainService {

    private final TemperatureReadingRepository readingRepository;
    private final ColdChainEventRepository eventRepository;
    private final FruitBatchRepository batchRepository;
    private final WarehouseRepository warehouseRepository;

    @Transactional
    public TemperatureReading recordReading(TemperatureReadingRequest request) {
        FruitBatch batch = batchRepository.findById(request.batchId())
                .orElseThrow(() -> new EntityNotFoundException("Batch not found"));

        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found"));

        TemperatureReading reading = TemperatureReading.builder()
                .batch(batch)
                .warehouse(warehouse)
                .temperature(request.temperature())
                .humidity(request.humidity())
                .timestamp(request.timestamp() != null ? request.timestamp() : java.time.Instant.now())
                .source(request.source() != null ? request.source() : ReadingSource.MANUAL_ENTRY)
                .notes(request.notes())
                .build();
        reading.setActive(true);

        reading = readingRepository.save(reading);

        // Check for excursion
        checkTemperatureExcursion(reading, warehouse, batch);

        return reading;
    }

    @Transactional
    public TemperatureReadingDto recordReadingDto(TemperatureReadingRequest request) {
        return mapReadingToDto(recordReading(request));
    }

    @Transactional(readOnly = true)
    public List<TemperatureReadingDto> getAllReadings() {
        return readingRepository.findAll().stream()
                .filter(TemperatureReading::isActive)
                .sorted(Comparator.comparing(TemperatureReading::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapReadingToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ColdChainEventDto> getAllEvents() {
        return eventRepository.findAll().stream()
                .filter(ColdChainEvent::isActive)
                .sorted(Comparator.comparing(ColdChainEvent::getEventTimestamp, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapEventToDto)
                .collect(Collectors.toList());
    }

    private TemperatureReadingDto mapReadingToDto(TemperatureReading r) {
        Warehouse w = r.getWarehouse();
        boolean exc = false;
        if (w != null && r.getTemperature() != null) {
            if (w.getMinTemperature() != null && r.getTemperature().doubleValue() < w.getMinTemperature()) exc = true;
            if (w.getMaxTemperature() != null && r.getTemperature().doubleValue() > w.getMaxTemperature()) exc = true;
        }
        return TemperatureReadingDto.builder()
                .id(r.getId())
                .batchId(r.getBatch() != null ? r.getBatch().getId() : null)
                .batchNumber(r.getBatch() != null ? r.getBatch().getBatchNumber() : null)
                .warehouseId(w != null ? w.getId() : null)
                .warehouseName(w != null ? w.getName() : null)
                .temperature(r.getTemperature())
                .humidity(r.getHumidity())
                .timestamp(r.getTimestamp())
                .source(r.getSource())
                .notes(r.getNotes())
                .excursion(exc)
                .build();
    }

    private ColdChainEventDto mapEventToDto(ColdChainEvent e) {
        return ColdChainEventDto.builder()
                .id(e.getId())
                .batchId(e.getBatch() != null ? e.getBatch().getId() : null)
                .batchNumber(e.getBatch() != null ? e.getBatch().getBatchNumber() : null)
                .warehouseId(e.getWarehouse() != null ? e.getWarehouse().getId() : null)
                .warehouseName(e.getWarehouse() != null ? e.getWarehouse().getName() : null)
                .eventType(e.getEventType())
                .eventTimestamp(e.getEventTimestamp())
                .notes(e.getNotes())
                .build();
    }

    private void checkTemperatureExcursion(TemperatureReading reading, Warehouse warehouse, FruitBatch batch) {
        if (warehouse.getMinTemperature() != null && reading.getTemperature().compareTo(BigDecimal.valueOf(warehouse.getMinTemperature())) < 0) {
            createEvent(batch, warehouse, ColdChainEventType.TEMPERATURE_EXCURSION, reading.getTimestamp(),
                    "Temperature dropped below minimum threshold of " + warehouse.getMinTemperature());
        } else if (warehouse.getMaxTemperature() != null && reading.getTemperature().compareTo(BigDecimal.valueOf(warehouse.getMaxTemperature())) > 0) {
            createEvent(batch, warehouse, ColdChainEventType.TEMPERATURE_EXCURSION, reading.getTimestamp(),
                    "Temperature exceeded maximum threshold of " + warehouse.getMaxTemperature());
        }
    }

    @Transactional
    public ColdChainEvent createEvent(FruitBatch batch, Warehouse warehouse, ColdChainEventType type, java.time.Instant timestamp, String notes) {
        ColdChainEvent event = ColdChainEvent.builder()
                .batch(batch)
                .warehouse(warehouse)
                .eventType(type)
                .eventTimestamp(timestamp)
                .notes(notes)
                .build();
        event.setActive(true);
        return eventRepository.save(event);
    }
    
    public List<ColdChainEvent> getEventsForBatch(UUID batchId) {
        return eventRepository.findByBatchId(batchId);
    }
    
    public List<TemperatureReading> getReadingsForBatch(UUID batchId) {
        return readingRepository.findByBatchId(batchId);
    }
}
