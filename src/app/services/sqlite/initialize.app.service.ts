
import { SQLiteService } from './sqlite.service';

import { Injectable } from '@angular/core';
import { MigrationService } from './migration.service';
import { ConfigService } from '../config/config.service';
import { Capacitor } from '@capacitor/core';
import { ToastService } from '../toast/toast.service';

@Injectable()
export class InitializeAppService {

  constructor(
    private toastService: ToastService,
    private sqliteService: SQLiteService,
    private configService: ConfigService,
    private migrationService: MigrationService) { }

  async initializeApp() {
    await this.sqliteService.initializePlugin().then(async (ret) => {
      try {
        //execute startup queries
        if (Capacitor.getPlatform() !== 'web') {
          await this.migrationService.migrate();
          await this.configService.load();
        }
      } catch (error) {
        console.error(error);(`initializeAppError: ${error}`);
      }
    });
  }

}
