import { createTemplate, dropTemplate } from './db.ts'

export async function setup(): Promise<void> {
  await createTemplate()
}

export async function teardown(): Promise<void> {
  await dropTemplate()
}
