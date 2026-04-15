import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb-client";

export const auth = betterAuth({
    database: mongodbAdapter((await clientPromise).db()),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    user: {
        additionalFields: {
            userType: {
                type: "string",
                required: true,
                defaultValue: "student",
            },
            collegeName: {
                type: "string",
                required: false,
            },
            yearOfStudy: {
                type: "string",
                required: false,
            },
            selfRatedSkillLevel: {
                type: "string",
                required: false,
            },
            currentRole: {
                type: "string",
                required: false,
            },
            yearsOfExperience: {
                type: "number",
                required: false,
            },
            technologiesCurrentlyWorkingWith: {
                type: "string", // Stored as a comma-separated string or JSON string to be simpler for migrations
                required: false,
            },
            targetRole: {
                type: "string",
                required: false,
            },
            languagesKnown: {
                type: "string", 
                required: false,
            },
            selectedDomain: {
                type: "string",
                required: false,
            },
        },
    },
    // Make sure to use the environment variable names the user provided
    secret: process.env.BETTERAUTH_SECRET,
    baseURL: process.env.BETTERAUTH_URL,
});
