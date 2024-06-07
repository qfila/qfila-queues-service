import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerIdColumnIntoQueue1698715702436
  implements MigrationInterface
{
  name = 'AddOwnerIdColumnIntoQueue1698715702436';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "queue" ADD "owner_id" varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "queue" DROP COLUMN "owner_id"`);
  }
}
