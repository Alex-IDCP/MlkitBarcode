import { Injectable } from '@angular/core';
import { dbConfig } from 'src/app/shared/database/config/db-config';
import { DatabaseService } from './database.service';
import { SQLiteService } from './sqlite.service';

export const sys_Parameter_Table: string = `CREATE TABLE IF NOT EXISTS Sys_Parameter (sys_ParameterId INTEGER PRIMARY KEY AUTOINCREMENT, apiUrl VARCHAR(255), imgUrl VARCHAR(255), lastDownloadAt DATETIME, rememberMe INTEGER, username VARCHAR(50), password VARCHAR(20));`;

export const check_system_parameter_table: string = `PRAGMA TABLE_INFO(Sys_Parameter)`;
export const system_parameter_add_new_col: string = `ALTER TABLE Sys_Parameter ADD COLUMN companyName TEXT; `;
export const system_parameter_add_new_col2: string = `ALTER TABLE Sys_Parameter ADD COLUMN jsonConfig TEXT; `;

export const create_item_master_table: string = `CREATE TABLE IF NOT EXISTS ITEM_MASTER (id INTEGER, code VARCHAR(100), itemDesc TEXT, typeCode VARCHAR(20), newId INTEGER, newDate DATE, brandId INTEGER, brandCd VARCHAR(20), brandDesc VARCHAR(100), groupId INTEGER, groupCd VARCHAR(20), groupDesc VARCHAR(100), catId INTEGER, catCd VARCHAR(20), catDesc VARCHAR(100), deptId INTEGER, seasonId INTEGER, varCd VARCHAR(100), price DECIMAL(6,6), minPrice DECIMAL(6,6), discId INTEGER, discCd VARCHAR(20), discPct DECIMAL(3,2), taxId INTEGER, taxCd VARCHAR(20), taxPct DECIMAL(3,2), imgUrl VARCHAR(255), launchDate DATE, uomId INTEGER, uomCd VARCHAR(20), uomDesc VARCHAR(100), isActiveMobile NUMERIC);`;

export const create_item_barcode_table: string = `CREATE TABLE IF NOT EXISTS ITEM_BARCODE (id INTEGER, itemId INTEGER, xId INTEGER, xCd VARCHAR(20), xDesc VARCHAR(255), xSeq INTEGER, yId INTEGER, yCd VARCHAR(20), yDesc VARCHAR(255), ySeq INTEGER, barcode VARCHAR(255), itemUomId INTEGER, sku VARCHAR(255), qty DECIMAL(6,0), transitQty DECIMAL(6,0), isOther VARCHAR(20), itemUomDesc VARCHAR(255)); `;

export const create_margin_config_table: string = `CREATE TABLE IF NOT EXISTS MARGIN_CONFIG (id INTEGER, trxDate DATE, locId INTEGER, type VARCHAR(20), typeId INTEGER, discCode VARCHAR(20), hLevel INTEGER, mPct DECIMAL(6,0), bPct DECIMAL(6,0), mExpr VARCHAR(255));`;

export const create_local_transaction_table: string = `CREATE TABLE IF NOT EXISTS LOCAL_TRANSACTION (id GUID PRIMARY KEY, apiUrl VARCHAR(255), trxType VARCHAR(100), lastUpdated DATE, jsonData TEXT)`

export const delete_inbound_tables: string = `DROP TABLE IF EXISTS ITEM_MASTER; DROP TABLE IF EXISTS ITEM_BARCODE; DROP TABLE IF EXISTS MARGIN_CONFIG;`;

@Injectable()
export class MigrationService {

	constructor(
		private sqliteService: SQLiteService,
		private databaseService: DatabaseService
	) { }

	async migrate(): Promise<any> {
		await this.createSystemParamTable();
		// await this.addSystemParamCol();
		await this.deleteInboundTables();
		await this.createInboundTables();
	}

	async createSystemParamTable(): Promise<void> {
		console.log(`going to create a connection`)
		const db = await this.sqliteService.createConnection(dbConfig.idcpcore, false, "no-encryption", 1);
		console.log(`db ${JSON.stringify(db)}`);

		await db.open();
		console.log(`after db.open`);

		console.log(`query ${sys_Parameter_Table}`);
		const ret: any = await db.execute(sys_Parameter_Table);
		console.log(`ret: ${JSON.stringify(ret)}`);

      const ret2: any = await db.query(check_system_parameter_table);
		console.log(`ret2: ${JSON.stringify(ret2.values.flatMap(r => r["name"]))}`);

      if (ret2.values && !ret2.values.flatMap(r => r["name"]).includes("companyName")) {
         const ret3: any = await db.execute(system_parameter_add_new_col);
         console.log(`ret3: ${JSON.stringify(ret3)}`);
      }

      if (ret2.values && !ret2.values.flatMap(r => r["name"]).includes("jsonConfig")) {
         const ret4: any = await db.execute(system_parameter_add_new_col2);
         console.log(`ret4: ${JSON.stringify(ret4)}`);
      }

		await this.sqliteService.closeConnection(dbConfig.idcpcore);
		console.log(`after closeConnection`);
	}

	async deleteInboundTables(): Promise<void> {
		console.log(`going to create a connection`)
		const db = await this.sqliteService.createConnection(dbConfig.inbounddb, false, "no-encryption", 1);
		console.log(`db ${JSON.stringify(db)}`);

		await db.open();
		console.log(`after db.open`);

		console.log(`query ${delete_inbound_tables}`);
		const ret: any = await db.execute(delete_inbound_tables);
		console.log(`ret: ${JSON.stringify(ret)}`);

		await this.sqliteService.closeConnection(dbConfig.inbounddb);
		console.log(`after closeConnection`);
	}

	async createInboundTables(): Promise<void> {
		console.log(`going to create a connection`)
		const db = await this.sqliteService.createConnection(dbConfig.inbounddb, false, "no-encryption", 1);
		console.log(`db ${JSON.stringify(db)}`);

		await db.open();
		console.log(`after db.open`);

		console.log(`query ${create_item_master_table}`);
		const ret: any = await db.execute(create_item_master_table);
		console.log(`ret: ${JSON.stringify(ret)}`);

		console.log(`query ${create_item_barcode_table}`);
		const ret2: any = await db.execute(create_item_barcode_table);
		console.log(`ret: ${JSON.stringify(ret2)}`);

		console.log(`query ${create_margin_config_table}`);
		const ret3: any = await db.execute(create_margin_config_table);
		console.log(`ret: ${JSON.stringify(ret3)}`);

		console.log(`query ${create_local_transaction_table}`);
		const ret4: any = await db.execute(create_local_transaction_table);
		console.log(`ret: ${JSON.stringify(ret4)}`);

		await this.sqliteService.closeConnection(dbConfig.inbounddb);
		console.log(`after closeConnection`);
	}

}
