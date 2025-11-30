import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useRouter } from "next/router";

const loginSchema = z.object({
    email: z.string().email(),
});

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    country: z.string().min(2, "Country must be valid"),
    email: z.string().email(),
});

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
});

export function LoginForm() {
    const router = useRouter();
    const [step, setStep] = useState<"auth" | "otp">("auth");
    const [email, setEmail] = useState("");
    const [activeTab, setActiveTab] = useState("login");

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "" },
    });

    const signupForm = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", country: "", email: "" },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const [error, setError] = useState<string | null>(null);

    const loginMutation = api.auth.login.useMutation({
        onSuccess: () => {
            setError(null);
            setStep("otp");
        },
        onError: (error) => setError(error.message),
    });

    const signupMutation = api.auth.signup.useMutation({
        onSuccess: () => {
            setError(null);
            setStep("otp");
        },
        onError: (error) => setError(error.message),
    });

    const verifyOtpMutation = api.auth.verifyOtp.useMutation({
        onSuccess: () => {
            setError(null);
            void router.push("/dashboard");
        },
        onError: (error) => setError(error.message),
    });

    const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
        setError(null);
        setEmail(values.email);
        loginMutation.mutate(values);
    };

    const onSignupSubmit = (values: z.infer<typeof signupSchema>) => {
        setError(null);
        setEmail(values.email);
        signupMutation.mutate(values);
    };

    const onOtpSubmit = (values: z.infer<typeof otpSchema>) => {
        setError(null);
        verifyOtpMutation.mutate({ email, otp: values.otp });
    };

    if (step === "otp") {
        return (
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Enter OTP</CardTitle>
                    <CardDescription>Sent to {email}</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}
                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                            <FormField
                                control={otpForm.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OTP</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending}>
                                {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Tabs defaultValue="login" className="w-[400px]" onValueChange={(val) => { setActiveTab(val); setError(null); }}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>Access your restaurant dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4" autoComplete="off">
                                <FormField
                                    control={loginForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="m@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                                    {loginMutation.isPending ? "Sending OTP..." : "Login"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="signup">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                        <CardDescription>Create a new account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                        <Form {...signupForm}>
                            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4" autoComplete="off">
                                <FormField
                                    control={signupForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={signupForm.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="India" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={signupForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="m@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
                                    {signupMutation.isPending ? "Sending OTP..." : "Sign Up"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
