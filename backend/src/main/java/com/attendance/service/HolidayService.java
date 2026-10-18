package com.attendance.service;

import com.attendance.entity.Holiday;
import com.attendance.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HolidayService {

    private final HolidayRepository holidayRepository;

    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAllByOrderByHolidayDateAsc();
    }

    @Transactional
    public Holiday createHoliday(Holiday holiday) {
        if (holiday.getHolidayDate() != null) {
            holiday.setDayOfWeek(holiday.getHolidayDate().getDayOfWeek().name());
        }
        if (holiday.getIsGovernmentHoliday() == null) {
            holiday.setIsGovernmentHoliday(false);
        }
        return holidayRepository.save(holiday);
    }

    @Transactional
    public Holiday updateHoliday(Long id, Holiday updated) {
        Holiday existing = holidayRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday not found with id: " + id));

        if (Boolean.TRUE.equals(existing.getIsGovernmentHoliday())) {
            throw new IllegalStateException("Mandatory Government / National holidays cannot be altered or rescheduled.");
        }

        existing.setName(updated.getName());
        existing.setHolidayDate(updated.getHolidayDate());
        if (updated.getHolidayDate() != null) {
            existing.setDayOfWeek(updated.getHolidayDate().getDayOfWeek().name());
        }
        existing.setHolidayType(updated.getHolidayType());
        existing.setDescription(updated.getDescription());

        return holidayRepository.save(existing);
    }

    @Transactional
    public void deleteHoliday(Long id) {
        Holiday existing = holidayRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday not found with id: " + id));

        if (Boolean.TRUE.equals(existing.getIsGovernmentHoliday())) {
            throw new IllegalStateException("Mandatory Government / National holidays cannot be deleted.");
        }

        holidayRepository.delete(existing);
    }
}
