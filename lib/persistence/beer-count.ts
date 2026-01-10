"use server"
import { neon } from '@neondatabase/serverless';
import { auth } from "@/lib//auth/auth";
import { headers } from "next/headers";

const sql = neon(`${process.env.DATABASE_URL}`);

export async function recordBeer(quantity: number) {
    // Validate quantity
    if (quantity <= 0) {
        throw new Error("Invalid quantity");
    }

    // Get session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    await sql.query(
        `INSERT INTO beer_totals (user_id, quantity)
         VALUES ($1, $2)
         ON CONFLICT (user_id)
         DO UPDATE SET quantity = beer_totals.quantity + $2`,
        [userId, quantity])

    const result = await sql.query(
        `INSERT INTO beers (user_id, beer_quantity) 
         VALUES ($1, $2)
         RETURNING id`,
        [userId, quantity]
    );

    const beerId = result[0].id;

    console.log(`Beer with id ${beerId} added for userId: ${userId}`)

    return beerId;
}

export async function removeBeer(beerId: number) {

    if (!Number.isInteger(beerId)) {
        throw new Error("Invalid beer id");
    }

    // Get session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // 1. Delete beer only if owned by user and return its quantity
    const deleteResult = await sql.query(
        `DELETE FROM beers
         WHERE id = $1
           AND user_id = $2
         RETURNING id, beer_quantity`,
        [beerId, userId]
    );

    if (deleteResult.length === 0) {
        throw new Error("Beer not found or not owned by user");
    }

    const quantity = deleteResult[0].beer_quantity;

    // 2. Decrement total
    await sql.query(
        `UPDATE beer_totals
         SET quantity = quantity - $1
         WHERE user_id = $2`,
        [quantity, userId]
    );

    console.log(`Beer with id ${beerId} deleted for userId: ${userId}`);

    return beerId;
}

export async function getBeerTotal(): Promise<number> {
    // Get session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const result = await sql.query(
        `SELECT quantity FROM beer_totals WHERE user_id = $1`,
        [userId]
    );

    // Return 0 if no record exists yet, ensure it's a number
    return result.length > 0 ? Number(result[0].quantity) : 0;
}


