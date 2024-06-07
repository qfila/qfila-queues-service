import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeColumn1701310630672 implements MigrationInterface {
  name = 'AddCodeColumn1701310630672';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "queue" ADD "code" varchar(6) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "queue" DROP COLUMN "code"`);
  }
}
