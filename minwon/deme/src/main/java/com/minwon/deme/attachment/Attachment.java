package com.minwon.deme.attachment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Entity
@Table(name = "attachment")
@Getter @Setter
public class Attachment {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "att_seq")
  @SequenceGenerator(name = "att_seq", sequenceName = "ATTACHMENT_SEQ", allocationSize = 1)
  private Long id;

  @Column(name = "original_name", nullable = false, length = 255)
  private String originalName;

  @Column(name = "content_type", nullable = false, length = 100)
  private String contentType;

  @Column(name = "file_size", nullable = false)
  private Long fileSize;

  @Lob
  @Basic(fetch = FetchType.LAZY)        
  @Column(name = "data", nullable = false)
  private byte[] data;                 

  @Column(name = "created_at", insertable = false, updatable = false)
  private Timestamp createdAt;          
}
