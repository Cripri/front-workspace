package com.minwon.deme.dto;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ResidentRegistration {
    Integer simple_doc_code;
	String complaint_category_code;
	Integer district_code;
	String status;
	@DateTimeFormat(pattern="yyyy-MM-dd")
	Date create_date;
	@DateTimeFormat(pattern="yyyy-MM-dd")
	Date complete_date;
	Integer	member_code;
	String member_name_en;
	String member_name_hanja;
	Integer doc_count;

	String all_Included; // 전부 포함

	//과거 주소 변동 사항
	String address_history;
	Integer address_history_years;

	//단순 포함 항목
	String household_reason; // 세대 구성 사유 포함
	String household_date;  // 세대 구성 일자 포함
	String occurrence_date; // 발생일 / 신고일 포함
	String head_name; // 세대주 성명 포함
	String roommate;
	String head_relationship; // 세대주와의 관계 포함
	String personal_change_details; // 인적사항 변경 내용 포함
	String id_number ; // 국내/외국인 등록번호 포함
	//  -- 주민등록번호 뒷자리
	String rrn_last7;
	String rrn_last7_self;
	String rrn_last7_member;
	//			-- 병역사항
	String military_service; // 항목 자체 포함 여부
	String military_service_basic_only; // 입영/전역일자만 포함
	String military_service_full; // 병역 전체정보 포함
	//  -- 과거 주소
	String previous_address;
	String previous_address_self;
	String previous_address_member;
}
