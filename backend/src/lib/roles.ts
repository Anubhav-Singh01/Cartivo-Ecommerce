import { User } from "@clerk/backend";
import type {UserRole} from "../db/schema.js";

const VALID : readonly UserRole[] = ["customer", "support", "admin"];

export function parseRole(value: unknown){
    if(typeof value === "string" && (VALID as readonly string[]).includes(value)){
        return value as UserRole;
    }
    return "customer";
}

export function isAdmin(role: UserRole){
    return role === "admin";
}

export function isStaff(role: UserRole){
    return role === "support" || role === "admin";
}