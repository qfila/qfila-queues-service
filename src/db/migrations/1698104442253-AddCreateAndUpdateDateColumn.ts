import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreateAndUpdateDateColumn1698104442253
  implements MigrationInterface
{
  name = 'AddCreateAndUpdateDateColumn1698104442253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`queue\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`queue\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`queue\` DROP COLUMN \`updated_at\``);
    await queryRunner.query(`ALTER TABLE \`queue\` DROP COLUMN \`created_at\``);
  }
}
