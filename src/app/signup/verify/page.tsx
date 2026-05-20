"use client";

import { firebaseAuth } from "@/app/firebase";
import { AbsoluteCenter, Button, Container, Highlight, Heading, Text, VStack } from "@chakra-ui/react";
import { sendEmailVerification } from "firebase/auth";
import { useEffect } from "react";

export default function Verify() {
    const user      = firebaseAuth.currentUser;
    const userEmail = user?.email;

    async function sendVerification() {
        if (user) {
            const actionCodeSettings = { url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000/' };
            await sendEmailVerification(user, actionCodeSettings);
        }
    }

    useEffect(() => { sendVerification(); }, []);

    return (
        <AbsoluteCenter>
            <Container padding="0.4em" maxW="400px" borderRadius="lg" boxShadow="lg">
                <VStack gap="0.6em" textAlign="center">
                    <Heading>Please verify your email</Heading>
                    <VStack gap={0}>
                        <Text>You're almost there! We sent an email to</Text>
                        <Text>{userEmail}</Text>
                    </VStack>
                    <Text marginY="0.7em">
                        <Highlight query="check your spam">
                            Just click on the link in that email to complete your signup. If you don't see it, you may need to check your spam folder.
                        </Highlight>
                    </Text>
                    <Text>Still can't find the email? No problem.</Text>
                    <Button onClick={sendVerification}>Resend Verification Email</Button>
                </VStack>
            </Container>
        </AbsoluteCenter>
    );
}
