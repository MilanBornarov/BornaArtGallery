package com.artgallery.service;

public interface TranslationService {
    String translateMacedonianToEnglish(String text, String fieldLabel);
    String translateEnglishToMacedonian(String text, String fieldLabel);
}
