package com.minwon.deme.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.minwon.deme.dto.Option;


@Controller
public class MainController {

    @GetMapping(value = {"/index", "/", "home"})
    public String home() {
        return "main";
    }

    @GetMapping("/minwon/info")
    public String minwonMaker() {
        return "minwon_maker/info";
    }
    
    @GetMapping("/minwon/search")
    public String getMethodName() {
        return "minwon_maker/search";
    }

    @GetMapping("/minwon/residentregistration")
    public String showForm(Model model) {
        List<Option> categoryItems = List.of(
            new Option("A","일반"),
            new Option("B","정정"),
            new Option("C","정리")
        );

        List<Option> genderItems = List.of(
            new Option("M","남성"),
            new Option("F","여성")
        );

        model.addAttribute("categoryItems", categoryItems);
        model.addAttribute("genderItems", genderItems);
        // 단일 선택 기본값
        model.addAttribute("selectedCategory", "A");

        return "minwon_maker/residentregistration";
    }

    @GetMapping("/minwon/test2222")
    public String view2(Model model){
        model.addAttribute("dto", null); // 일단 null
        return "minwon_maker/residentregistration";
    }


    @GetMapping("/minwon/sign")
    public String sign() {
        return "fragments/sign";
    }
    
    @GetMapping("/minwon/signtest")
    public String sign3() {
        return "fragments/sign2";
    }

    @GetMapping("/minwon/test")
    public String sign2() {
        return "minwon_maker/residentregistration2";
    }
    
}
