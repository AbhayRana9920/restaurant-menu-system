import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export const authRouter = createTRPCRouter({
    signup: publicProcedure
        .input(z.object({
            email: z.string().email("Please enter a valid email address"),
            name: z.string().min(2),
            country: z.string().min(2),
        }))
        .mutation(async ({ ctx, input }) => {
            const existingUser = await ctx.db.user.findUnique({
                where: { email: input.email },
            });

            if (existingUser) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Email already in use. Please use a non-existing email.",
                });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

            // Send Email
            if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
                const nodemailer = await import("nodemailer");
                const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: input.email,
                    subject: "Your Login OTP",
                    text: `Your OTP is: ${otp}`,
                    html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
                });
            } else {
                console.log(`OTP for ${input.email}: ${otp}`);
            }

            await ctx.db.user.create({
                data: {
                    email: input.email,
                    name: input.name,
                    country: input.country,
                    otp,
                    otpExpires,
                },
            });

            return { success: true, message: "OTP sent to email" };
        }),

    login: publicProcedure
        .input(z.object({ email: z.string().email("Please enter a valid email address") }))
        .mutation(async ({ ctx, input }) => {
            try {
                const user = await ctx.db.user.findUnique({
                    where: { email: input.email },
                });

                if (!user) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "User not found. Please sign up first.",
                    });
                }

                // Generate OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

                // Send Email
                if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
                    const nodemailer = await import("nodemailer");
                    const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
                    await transporter.sendMail({
                        from: process.env.EMAIL_FROM,
                        to: user.email,
                        subject: "Your Login OTP",
                        text: `Your OTP is: ${otp}`,
                        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
                    });
                } else {
                    console.log(`OTP for ${user.email}: ${otp}`);
                }

                await ctx.db.user.update({
                    where: { email: input.email },
                    data: { otp, otpExpires },
                });

                return { success: true, message: "OTP sent to email" };
            } catch (error) {
                if (error instanceof TRPCError) throw error;
                console.error("Login error:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to login. Please check your connection or try again later.",
                });
            }
        }),

    verifyOtp: publicProcedure
        .input(z.object({ email: z.string().email(), otp: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: { email: input.email },
            });

            if (!user || user.otp !== input.otp || !user.otpExpires || user.otpExpires < new Date()) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid or expired OTP",
                });
            }

            // Clear OTP after successful verification
            await ctx.db.user.update({
                where: { email: input.email },
                data: { otp: null, otpExpires: null },
            });

            // Generate JWT
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || "supersecret",
                { expiresIn: "7d" }
            );

            // Set Cookie
            ctx.res.setHeader(
                "Set-Cookie",
                serialize("auth_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                })
            );

            return { success: true, user: { id: user.id, name: user.name, email: user.email } };
        }),

    me: protectedProcedure.query(({ ctx }) => {
        return ctx.user;
    }),
});
