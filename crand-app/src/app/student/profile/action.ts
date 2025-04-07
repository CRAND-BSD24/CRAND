'use server'

import { getMongoClientInstance } from "@/db/config/connection";

export const getProfile = async () => {
    const client = await getMongoClientInstance();
}