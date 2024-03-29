import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Player, SoundsStatus, Theme } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  setPlayer(player: Player): void {
    this.setPreference('player', player);
  }

  getPlayer(): Promise<Player | null> {
    return this.getPreference('player');
  }

  setTheme(theme: Theme): void {
    this.setPreference('theme', theme);
  }

  getTheme(): Promise<Theme | null> {
    return this.getPreference('theme');
  }

  setLanguage(lang: string): void {
    this.setPreference('lang', lang);
  }

  getLanguage(): Promise<string | null> {
    return this.getPreference('lang');
  }

  setSoundsStatus(soudsStatus: SoundsStatus): void {
    this.setPreference('soudsStatus', soudsStatus);
  }

  getSoundsStatus(): Promise<SoundsStatus | null> {
    return this.getPreference('soudsStatus');
  }

  private async setPreference(key: string, value: any): Promise<void> {
    await Preferences.set({
      key,
      value,
    });
  }

  private async getPreference(key: string): Promise<any> {
    const { value } = await Preferences.get({
      key,
    });
    return value;
  }
}
