import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
    let dbStatus = "Checking..."
    let dbError = null
    let envStatus = {
        DATABASE_URL: "Missing",
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL ? "Yes" : "No",
    }

    // Check Env
    if (process.env.DATABASE_URL) {
        envStatus.DATABASE_URL = `Set (Length: ${process.env.DATABASE_URL.length})`
    }

    // Test DB Connection
    try {
        await prisma.$connect()
        // Try a simple query
        const userCount = await prisma.user.count()
        dbStatus = `Connected! User count: ${userCount}`
    } catch (e: any) {
        dbStatus = "Failed"
        dbError = e.message + "\n" + JSON.stringify(e, null, 2)
    }

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Debug Info</h1>

            <div className="mb-6 p-4 border rounded bg-gray-50">
                <h2 className="font-bold mb-2">Environment</h2>
                <pre>{JSON.stringify(envStatus, null, 2)}</pre>
            </div>

            <div className="mb-6 p-4 border rounded bg-gray-50">
                <h2 className="font-bold mb-2">Database Connection</h2>
                <div className={dbStatus === "Failed" ? "text-red-600" : "text-green-600"}>
                    Status: {dbStatus}
                </div>
                {dbError && (
                    <pre className="mt-2 p-2 bg-red-50 text-red-800 overflow-auto whitespace-pre-wrap">
                        {dbError}
                    </pre>
                )}
            </div>

            <p className="text-gray-500 text-xs mt-8">
                Delete this page after debugging.
            </p>
        </div>
    )
}
