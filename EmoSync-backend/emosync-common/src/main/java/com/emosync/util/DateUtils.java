package com.emosync.util;

import java.time.LocalDate;

public class DateUtils {
    /**
     * Calculate the first day of last month.
     * @return LocalDate object representing the first day of last month.
     */
    public static LocalDate getLastMonthFirstDay() {
        LocalDate today = LocalDate.now(); // Get current date
        int currentMonth = today.getMonthValue(); // Get current month
        int currentYear = today.getYear(); // Get current year

        // If current month is January, then last month is December of last year
        if (currentMonth == 1) {
            return LocalDate.of(currentYear - 1, 12, 1);
        } else {
            // Otherwise, the first day of last month is current year plus last month minus 1, date is 1
            return LocalDate.of(currentYear, currentMonth - 1, 1);
        }
    }
}
