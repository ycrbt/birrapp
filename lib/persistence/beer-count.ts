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

export async function getBeerRankings(): Promise<Array<{ name: string; quantity: number }>> {
    const result = await sql.query(
        `SELECT "user".name, bt.quantity
         FROM beer_totals bt
         JOIN "user" ON bt.user_id = "user".id
         ORDER BY bt.quantity DESC
         LIMIT 10`
    );

    return result.map(row => ({
        name: row.name.split(' ')[0],
        quantity: Number(row.quantity)
    }));
}

export async function getBeersByMonth(year: number, month: number): Promise<Array<{ date: string; quantity: number }>> {
    // Get session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Get beers for the specified month (month is 0-indexed in JS, 1-indexed in SQL)
    const result = await sql.query(
        `SELECT TO_CHAR(date_drinked AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid', 'YYYY-MM-DD') as date, SUM(beer_quantity) as quantity
         FROM beers
         WHERE user_id = $1
           AND EXTRACT(YEAR FROM date_drinked AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid') = $2
           AND EXTRACT(MONTH FROM date_drinked AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid') = $3
         GROUP BY TO_CHAR(date_drinked AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid', 'YYYY-MM-DD')
         ORDER BY date`,
        [userId, year, month + 1] // Convert JS month (0-11) to SQL month (1-12)
    );

    return result.map(row => ({
        date: row.date,
        quantity: Number(row.quantity)
    }));
}

export async function getDetailedBeersByMonth(year: number, month: number): Promise<Array<{ id: number; quantity: number; date: string; time: string }>> {
    // Get session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Get individual beers for the specified month
    const result = await sql.query(
        `SELECT id, beer_quantity, 
                TO_CHAR(date_drinked AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid', 'YYYY-MM-DD') as date,
                date_drinked AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid' as local_datetime
         FROM beers
         WHERE user_id = $1
           AND EXTRACT(YEAR FROM date_drinked AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid') = $2
           AND EXTRACT(MONTH FROM date_drinked AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid') = $3
         ORDER BY date_drinked`,
        [userId, year, month + 1]
    );

    return result.map(row => ({
        id: row.id,
        quantity: Number(row.beer_quantity),
        date: row.date, // Already in YYYY-MM-DD format
        time: new Date(row.local_datetime).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }));
}

export async function recordBeerWithDateTime(quantity: number, dateTime: string) {
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

    // Update total
    await sql.query(
        `INSERT INTO beer_totals (user_id, quantity)
         VALUES ($1, $2)
         ON CONFLICT (user_id)
         DO UPDATE SET quantity = beer_totals.quantity + $2`,
        [userId, quantity])

    // Insert beer with specific date/time
    const result = await sql.query(
        `INSERT INTO beers (user_id, beer_quantity, date_drinked) 
         VALUES ($1, $2, $3)
         RETURNING id`,
        [userId, quantity, dateTime]
    );

    const beerId = result[0].id;

    console.log(`Beer with id ${beerId} added for userId: ${userId} at ${dateTime}`)

    return beerId;
}

export async function updateBeer(beerId: number, quantity: number, dateTime: string) {
    // Validate inputs
    if (!Number.isInteger(beerId) || quantity <= 0) {
        throw new Error("Invalid beer id or quantity");
    }

    // Get session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    // Get the current beer data to calculate the difference
    const currentBeerResult = await sql.query(
        `SELECT beer_quantity FROM beers WHERE id = $1 AND user_id = $2`,
        [beerId, userId]
    );

    if (currentBeerResult.length === 0) {
        throw new Error("Beer not found or not owned by user");
    }

    const currentQuantity = Number(currentBeerResult[0].beer_quantity);
    const quantityDifference = quantity - currentQuantity;

    // Update the beer record
    await sql.query(
        `UPDATE beers 
         SET beer_quantity = $1, date_drinked = $2
         WHERE id = $3 AND user_id = $4`,
        [quantity, dateTime, beerId, userId]
    );

    // Update the total
    await sql.query(
        `UPDATE beer_totals
         SET quantity = quantity + $1
         WHERE user_id = $2`,
        [quantityDifference, userId]
    );

    console.log(`Beer with id ${beerId} updated for userId: ${userId}`);

    return beerId;
}