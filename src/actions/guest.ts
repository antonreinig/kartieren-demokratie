"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteGuestAccount(guestToken: string) {
    if (!guestToken) {
        return { success: false, error: "Guest token is required" };
    }

    try {
        // Delete all ChatSessions associated with this guestToken
        // On cascade, this should delete all ChatMessages as well.
        await prisma.chatSession.deleteMany({
            where: {
                guestToken: guestToken
            }
        });

        // If there are other models linked to guestToken, delete them here.
        // Currently, only ChatSession uses guestToken directly.

        return { success: true };
    } catch (error) {
        console.error("Error deleting guest account:", error);
        return { success: false, error: "Failed to delete account" };
    }
}
