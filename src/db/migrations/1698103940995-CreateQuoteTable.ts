import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuoteTable1698103940995 implements MigrationInterface {
  name = 'CreateQuoteTable1698103940995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`queue\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(63) NOT NULL, \`description\` varchar(255) NOT NULL, \`average_wait_time_in_minutes\` smallint NOT NULL, \`max_participants\` smallint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`queue\``);
  }
}
