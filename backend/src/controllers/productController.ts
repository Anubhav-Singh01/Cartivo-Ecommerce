import type { Request, Response, NextFunction } from "express";
import { products } from "../db/schema";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";


export async function listProducts(req: Request, res: Response, next: NextFunction){
    try {
        const cat = typeof req.query.category === "string" ? req.query.category.trim() : "";

        const activeOnly = eq(products.active, true);
        const whereClause = cat ? and(activeOnly, eq(products.category, cat)): activeOnly;
        
        const rows = await db.select().from(products).where(whereClause).orderBy(desc(products.createdAt));

        res.json({products: rows});
    } catch (e) {
        next(e);
        
    }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction){
    try {
        const rows = await db.select({category: products.category}).from(products).where(eq(products.active,true));

        const categories = [...new Set(rows.map((r) => r.category))].sort((a,b) => a.localeCompare(b));

        res.json({categories});
    } catch (e) {
        next(e);
    }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction){
    try {
        const [row] = await db.select().from(products).where(eq(products.slug, req.params.slug as string)).limit(1);

        if(!row || !row.active) return res.status(404).json({error: "Not found"});
    } catch (e) {
        next(e);
    }
}