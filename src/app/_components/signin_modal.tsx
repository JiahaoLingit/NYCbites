'use client'

import { firebaseAuth, firebaseApp } from "@/app/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
    Text, Button, CloseButton, Dialog, Field, Input, Portal,
    VStack, HStack, Separator, Link as ChakraLink, useDialog, UseDialogReturn
} from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthDispatch } from "@/app/_components/auth_provider";
import { useState } from "react";
import Link from "next/link";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

function SigninModalContent({ dialog }: { dialog: UseDialogReturn }) {
    const router   = useRouter();
    const dispatch = useAuthDispatch();
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);

    async function handleEmailSignIn() {
        setError(''); setLoading(true);
        try {
            await signInWithEmailAndPassword(firebaseAuth, email, password);
            dispatch?.({ type: 'sign_in' });
            dialog.setOpen(false);
            router.push('/prefer');
        } catch {
            setError('Invalid email or password.');
        } finally { setLoading(false); }
    }
    async function handleGoogleSignIn() {
        setError(''); setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(firebaseAuth, provider);
            dispatch?.({ type: 'sign_in' });
            const db = getFirestore(firebaseApp);
            await setDoc(doc(db, 'users', firebaseAuth.currentUser!.uid), { profile_verified: true }, { merge: true });
            dialog.setOpen(false);
            router.push('/prefer');
        } catch {
            setError('Google sign-in failed.');
        } finally { setLoading(false); }
    }

    return (
        <VStack gap={4}>
            <Field.Root>
                <Input placeholder="Email" value={email}
                    onChange={e => setEmail(e.target.value)} borderRadius="lg" />
            </Field.Root>
            <Field.Root>
                <PasswordInput placeholder="Password" value={password}
                    onChange={e => setPassword(e.target.value)} borderRadius="lg" />
            </Field.Root>

            {error && <Text color="red.500" fontSize="sm">{error}</Text>}

            <Button w="full" bg="orange.500" color="white" fontWeight="700"
                borderRadius="full" disabled={loading || !email || !password}
                onClick={handleEmailSignIn}
                _hover={{ bg: "orange.600" }}>
                {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <HStack w="full" gap={3}>
                <Separator flex={1} />
                <Text fontSize="sm" color="gray.400" flexShrink={0}>or</Text>
                <Separator flex={1} />
            </HStack>

            <Button w="full" variant="outline" borderRadius="full"
                borderColor="gray.300" fontWeight="600"
                disabled={loading} onClick={handleGoogleSignIn}>
                🔵 Continue with Google
            </Button>

            <Text fontSize="sm" color="gray.500" textAlign="center">
                Don't have an account?{' '}
                <ChakraLink onClick={() => dialog.setOpen(false)} asChild>
                    <Link href="/signup" style={{ color: '#ea580c', fontWeight: 600 }}>
                        Sign Up
                    </Link>
                </ChakraLink>
            </Text>
        </VStack>
    );
}

export default function SigninModal() {
    const dialog = useDialog();
    return (
        <Dialog.RootProvider value={dialog} placement="center" motionPreset="slide-in-bottom">
            <Dialog.Trigger asChild>
                <Button 
                    size="sm" 
                    fontWeight={600}
                    color="white"
                    borderRadius="8px"
                    padding="7px 16px"
                    fontSize="13px"
                    fontFamily="system-ui"
                    bg="linear-gradient(135deg, #c2410c, #ea580c)"
                    boxShadow="0 2px 8px rgba(234,88,12,0.3)"
                    _hover={{ 
                        bg: "linear-gradient(135deg, #ea580c, #f97316)", 
                        boxShadow: "0 4px 12px rgba(234,88,12,0.5)" 
                    }}
                >
                    Sign In
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" overflow="hidden">
                        <Dialog.Header borderBottom="0.5px solid" borderColor="gray.100">
                            <Dialog.Title>Welcome back 🍽️</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body py={6}>
                            <SigninModalContent dialog={dialog} />
                        </Dialog.Body>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.RootProvider>
    );
}
