import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuoteTable1698103940995 implements MigrationInterface {
  name = 'CreateQuoteTable1698103940995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "queue" (
        "id" uuid NOT NULL,
        "title" varchar(63) NOT NULL,
        "description" varchar(255) NOT NULL,
        "average_wait_time_in_minutes" smallint NOT NULL,
        "max_participants" smallint NOT NULL,
        CONSTRAINT "PK_queue_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "queue"`);
  }
}
