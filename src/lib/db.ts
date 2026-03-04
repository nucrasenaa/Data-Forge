import mssql from 'mssql';
import mysql from 'mysql2/promise';
import { Pool as PgPool } from 'pg';

export interface DbProxy {
  query: (sql: string) => Promise<any>;
  close: () => Promise<void>;
}

export async function getDbProxy(config: any): Promise<DbProxy> {
  const dbType = config.dbType || 'mssql';

  if (dbType === 'mysql' || dbType === 'mariadb') {
    const connConfig = config.connectionString
      ? config.connectionString
      : {
        host: config.server,
        port: config.port || 3306,
        user: config.user,
        password: config.password,
        database: config.database,
        multipleStatements: true
      };

    const connection = await mysql.createConnection(connConfig);

    return {
      query: async (sql: string) => {
        const [rows] = await connection.query(sql);
        return rows;
      },
      close: async () => {
        await connection.end();
      }
    };
  } else if (dbType === 'postgres') {
    const pool = new PgPool(
      config.connectionString
        ? { connectionString: config.connectionString }
        : {
          host: config.server,
          port: config.port || 5432,
          user: config.user,
          password: config.password,
          database: config.database,
          ssl: config.options?.encrypt ? { rejectUnauthorized: false } : false
        }
    );

    return {
      query: async (sql: string) => {
        const res = await pool.query(sql);
        return res.rows;
      },
      close: async () => {
        await pool.end();
      }
    };
  } else {
    // Default to MSSQL
    let pool;
    if (config.connectionString) {
      pool = await mssql.connect(config.connectionString);
    } else {
      pool = await mssql.connect({
        ...config,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          ...config.options,
        },
      });
    }

    const proxy: DbProxy = {
      query: async (sql: string) => {
        const result = await pool.request().query(sql) as any;
        if (result.recordsets && result.recordsets.length > 1) {
          return result.recordsets;
        }
        return result.recordset;
      },
      close: async () => {
        await pool.close();
      }
    };
    return proxy;
  }
}
