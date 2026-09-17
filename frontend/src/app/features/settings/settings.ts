import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {
  activeTab: 'profile' | 'ai' | 'appearance' = 'profile';
  
  isSaving = false;
  showToast = false;

  profile = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrator'
  };

  aiConfig = {
    model: 'claude-3-5-sonnet',
    apiKey: '',
    temperature: 0.7
  };

  appearance = {
    theme: 'dark',
    scale: 100
  };

  ngOnInit(): void {
    // Load from localStorage if available
    const savedProfile = localStorage.getItem('ba_settings_profile');
    if (savedProfile) this.profile = JSON.parse(savedProfile);

    const savedAi = localStorage.getItem('ba_settings_ai');
    if (savedAi) this.aiConfig = JSON.parse(savedAi);

    const savedApp = localStorage.getItem('ba_settings_appearance');
    if (savedApp) this.appearance = JSON.parse(savedApp);
  }

  getInitials(): string {
    return this.profile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  saveSettings(event: Event): void {
    event.preventDefault();
    this.isSaving = true;

    // Save to localStorage
    localStorage.setItem('ba_settings_profile', JSON.stringify(this.profile));
    localStorage.setItem('ba_settings_ai', JSON.stringify(this.aiConfig));
    localStorage.setItem('ba_settings_appearance', JSON.stringify(this.appearance));

    // Simulate API delay
    setTimeout(() => {
      this.isSaving = false;
      this.showToast = true;
      
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    }, 800);
  }
}
