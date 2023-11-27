import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserQueueTable1698703505237 implements MigrationInterface {
  name = 'CreateUserQueueTable1698703505237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`queue_user\` (\`id\` varchar(36) NOT NULL, \`queue_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`exited\` tinyint NOT NULL DEFAULT 0, \`position\` smallint NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`queue_user\``);
  }
}
