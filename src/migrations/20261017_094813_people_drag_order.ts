import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "people" ALTER COLUMN "order" DROP DEFAULT;
  ALTER TABLE "_people_v" ALTER COLUMN "version_order" DROP DEFAULT;
  ALTER TABLE "people" ADD COLUMN "_order" varchar;
  ALTER TABLE "_people_v" ADD COLUMN "version__order" varchar;
  CREATE INDEX "people__order_idx" ON "people" USING btree ("_order");
  CREATE INDEX "_people_v_version_version__order_idx" ON "_people_v" USING btree ("version__order");`)

  // Give existing people a drag-and-drop position that matches their old "order" number.
  const { rows } = await db.execute(
    sql`SELECT id FROM "people" ORDER BY "order" ASC NULLS LAST, "full_name" ASC`,
  )
  for (const [i, row] of (rows as { id: number }[]).entries()) {
    await db.execute(sql`UPDATE "people" SET "_order" = ${orderKey(i)} WHERE "id" = ${row.id}`)
  }
  await db.execute(sql`
   UPDATE "_people_v" v SET "version__order" = p."_order" FROM "people" p WHERE v."parent_id" = p."id";`)
}

const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

/** Ascending fractional-index keys in Payload's format: a0…az, then b00…bzz. */
function orderKey(i: number): string {
  if (i < 62) return `a${DIGITS[i]}`
  const n = i - 62
  return `b${DIGITS[Math.floor(n / 62) % 62]}${DIGITS[n % 62]}`
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "people__order_idx";
  DROP INDEX "_people_v_version_version__order_idx";
  ALTER TABLE "people" ALTER COLUMN "order" SET DEFAULT 100;
  ALTER TABLE "_people_v" ALTER COLUMN "version_order" SET DEFAULT 100;
  ALTER TABLE "people" DROP COLUMN "_order";
  ALTER TABLE "_people_v" DROP COLUMN "version__order";`)
}
