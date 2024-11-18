import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SQLiteService } from './sqlite.service';

interface SQLiteDBConnectionCallback<T> { (myArguments: SQLiteDBConnection): T }

@Injectable()
export class DatabaseService {

   constructor(
      private sqlite: SQLiteService
   ) { }

   /**
    * this function will handle the sqlite isopen and isclosed automatically for you.
    * @param callback: The callback function that will execute multiple SQLiteDBConnection commands or other stuff.
    * @param databaseName optional another database name
    * @returns any type you want to receive from the callback function.
    */
   async executeQuery<T>(callback: SQLiteDBConnectionCallback<T>, databaseName: string): Promise<T> {
      console.log(`databaseName: ${JSON.stringify(databaseName)}`);
      try {
         let isConnection = await this.sqlite.isConnection(databaseName);
         console.log(`isConnection: ${JSON.stringify(isConnection)}`);
         if (isConnection.result) {
            let db = await this.sqlite.retrieveConnection(databaseName);
            return await callback(db);
         }
         else {
            const db = await this.sqlite.createConnection(databaseName, false, "no-encryption", 1);
            await db.open();
            let cb = await callback(db);
            await this.sqlite.closeConnection(databaseName);
            return cb;
         }
      } catch (error) {
         console.error(error); (error.message);
      }
   }

}

