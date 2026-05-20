"use client";

import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Box, Button, HStack, Input, Separator, Text, VStack,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { GoogleAuthProvider, signInWithCustomToken, signInWithPopup } from 'firebase/auth';
import { firebaseApp, firebaseAuth } from '../firebase';
import { useAuthDispatch } from '../_components/auth_provider';
import { doc, getFirestore, setDoc } from "firebase/firestore";
import Link from 'next/link';

const api = axios.create({ baseURL: 'http://localhost:3001/signin' });

export default function SignUp() {
    const router   = useRouter();
    const dispatch = useAuthDispatch();

    const [email,           setEmail]           = useState('');
    const [username,        setUsername]        = useState('');
    const [password,        setPassword]        = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error,           setError]           = useState('');
    const [loading,         setLoading]         = useState(false);

    const emailValid    = /\S+@\S+\.\S+/.test(email);
    const passwordValid = password.length >= 8;
    const passwordMatch = confirmPassword.length > 0 && password === confirmPassword;
    const canSubmit     = emailValid && passwordValid && passwordMatch && username.length > 0;

    async function handleGoogleSignup() {
        setError(''); setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(firebaseAuth, provider);
            dispatch?.({ type: 'sign_in' });
            const db = getFirestore(firebaseApp);
            await setDoc(doc(db, 'users', firebaseAuth.currentUser!.uid), { profile_verified: true }, { merge: true });
            router.push('/prefer');
        } catch (err) {
            setError('Google sign-up failed. Please try again.');
        } finally { setLoading(false); }
    }

    async function handleEmailSignup() {
        setError(''); setLoading(true);
        try {
            const res = await api.post('/api/signup-email', { data: { email, username, password } });
            if (res.status === 200) {
                await signInWithCustomToken(firebaseAuth, res.data.token);
                dispatch?.({ type: 'sign_in' });
                const db = getFirestore(firebaseApp);
                await setDoc(doc(db, 'users', firebaseAuth.currentUser!.uid), { profile_verified: true }, { merge: true });
                router.push('/prefer');
            }
        } catch (err: any) {
            setError(err.response?.data ?? 'Something went wrong. Please try again.');
        } finally { setLoading(false); }
    }

    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center"
            bg="linear-gradient(160deg, #fff7ed 0%, #ffffff 50%, #fff1e6 100%)">
            <Box w="full" maxW="400px" mx={4}
                bg="white" borderRadius="2xl" boxShadow="lg"
                border="0.5px solid" borderColor="gray.100" overflow="hidden">

                {/* Header */}
                <Box bg="linear-gradient(135deg, #c05621, #ea580c)" px={8} py={7} textAlign="center">
                    <Text fontSize="28px" mb={1}>🍽️</Text>
                    <Text fontSize="xl" fontWeight="700" color="white">Create your account</Text>
                    <Text fontSize="sm" color="orange.100" mt={1}>Start discovering great restaurants</Text>
                </Box>

                <Box px={8} py={7}>
                    <VStack gap={4}>
                        <Field.Root invalid={email.length > 0 && !emailValid}>
                            <Input placeholder="Email address" value={email}
                                onChange={e => setEmail(e.target.value)}
                                borderRadius="lg" />
                        </Field.Root>

                        <Field.Root>
                            <Input placeholder="Username" value={username}
                                onChange={e => setUsername(e.target.value)}
                                borderRadius="lg" />
                        </Field.Root>

                        <Field.Root invalid={password.length > 0 && !passwordValid}>
                            <PasswordInput placeholder="Password (min 8 chars)"
                                visibilityIcon={{ on: null, off: null }}
                                value={password} onChange={e => setPassword(e.target.value)}
                                borderRadius="lg" />
                        </Field.Root>

                        <Field.Root invalid={confirmPassword.length > 0 && !passwordMatch}>
                            <PasswordInput placeholder="Confirm password"
                                visibilityIcon={{ on: null, off: null }}
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                borderRadius="lg" />
                        </Field.Root>

                        {error && <Text color="red.500" fontSize="sm" textAlign="center">{error}</Text>}

                        <Button w="full" borderRadius="full"
                            bg={canSubmit ? "orange.500" : "gray.200"}
                            color={canSubmit ? "white" : "gray.400"}
                            fontWeight="700" fontSize="15px"
                            disabled={!canSubmit || loading}
                            onClick={handleEmailSignup}
                            _hover={canSubmit ? { bg: "orange.600" } : {}}>
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </Button>

                        <HStack w="full" gap={3}>
                            <Separator flex={1} />
                            <Text fontSize="sm" color="gray.400" flexShrink={0}>or</Text>
                            <Separator flex={1} />
                        </HStack>

                        <Button w="full" variant="outline" borderRadius="full"
                            borderColor="gray.300" fontWeight="600"
                            disabled={loading} onClick={handleGoogleSignup}>
                            🔵 Continue with Google
                        </Button>

                        <Text fontSize="sm" color="gray.500" textAlign="center">
                            Already have an account?{' '}
                            <Link href="/" style={{ color: '#ea580c', fontWeight: 600 }}>
                                Sign in
                            </Link>
                        </Text>
                    </VStack>
                </Box>
            </Box>
        </Box>
    );
}
