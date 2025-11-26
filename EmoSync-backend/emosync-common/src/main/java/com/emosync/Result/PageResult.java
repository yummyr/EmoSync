package com.emosync.Result;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResult<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private long total;
    private List<T> records;


    // constructor
    public PageResult(org.springframework.data.domain.Page<?> page, List<T> records) {
        this.total = page.getTotalElements();
        this.records = records;

    }


}