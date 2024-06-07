import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserQueueTable1698703505237 implements MigrationInterface {
  name = 'CreateUserQueueTable1698703505237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "queue_user" (
        "id" uuid NOT NULL,
        "queue_id" varchar(255) NOT NULL,
        "user_id" varchar(255) NOT NULL,
        "exited" boolean NOT NULL DEFAULT false,
        "position" smallint NOT NULL,
        "created_at" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_queue_user_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "queue_user"`);
  }
}
