package com.minwon.deme.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;




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
    
    
}
