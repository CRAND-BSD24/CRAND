'use server'

import { getMongoClientInstance } from "@/db/config/connection";

export const login = async (formData: FormData) => {
    const client = await getMongoClientInstance();
}