import 'dotenv/config';
import { registerAs } from '@nestjs/config';
const config = {
  type: process.env.DATABASE_TYPE || 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 3306,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
  synchronize: false,
  logging: false,
  migrationsTableName: 'migrations',
};

export default registerAs('database', () => config);
