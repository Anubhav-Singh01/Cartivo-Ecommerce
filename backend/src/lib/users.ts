import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export async function getLocalUser(clerkUserId: string){
    const [row] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
    return row;
}