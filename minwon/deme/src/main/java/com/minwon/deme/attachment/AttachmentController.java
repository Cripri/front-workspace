package com.minwon.deme.attachment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
@RequiredArgsConstructor
public class AttachmentController {

  private final AttachmentRepository repo;

  @GetMapping("/attachments/upload")
  public String uploadForm() { return "attachments/upload"; }

  @PostMapping("/attachments/upload")
  public String upload(@RequestParam("file") MultipartFile file,
                       org.springframework.ui.Model model) throws IOException {
    if (file.isEmpty()) {
      model.addAttribute("error", "파일이 비어있습니다.");
      return "attachments/upload";
    }

    Attachment a = new Attachment();
    a.setOriginalName(file.getOriginalFilename());
    a.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
    a.setFileSize(file.getSize());
    a.setData(file.getBytes());
    a = repo.save(a);

    model.addAttribute("id", a.getId());
    model.addAttribute("name", a.getOriginalName());
    return "attachments/result";
  }

  @GetMapping("/attachments/{id}/download")
  @Transactional(readOnly = true)
  public void download(@PathVariable Long id, HttpServletResponse resp) throws IOException {
    Attachment a = repo.findById(id).orElseThrow();

    String ctype = a.getContentType() == null ? "application/octet-stream" : a.getContentType();
    String filename = URLEncoder.encode(a.getOriginalName(), StandardCharsets.UTF_8);

    resp.setContentType(ctype);
    resp.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
    if (a.getFileSize() != null) {
      resp.setContentLengthLong(a.getFileSize());
    }

    try (OutputStream os = resp.getOutputStream()) {
      os.write(a.getData()); 
      os.flush();   
    }
  }
}
