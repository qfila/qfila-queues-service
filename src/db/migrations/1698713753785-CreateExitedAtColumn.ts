import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExitedAtColumn1698713753785 implements MigrationInterface {
  name = 'CreateExitedAtColumn1698713753785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "queue_user" ADD "exited_at" date NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "queue_user" DROP COLUMN "exited_at"`);
  }
}
