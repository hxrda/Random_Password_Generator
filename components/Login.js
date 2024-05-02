//import { StatusBar } from "expo-status-bar";
//import { useState, useEffect } from "react";
//import { StyleSheet, Text, View, StatusBar, Button } from "react-native";

import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	View,
	Image,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
} from "react-native"; //Text removed
//import { Image } from "@rneui/themed";
import {
	TextInput,
	Text,
	Button,
	PaperProvider,
	Modal,
	Portal,
} from "react-native-paper";

import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";

//import { RSAKey } from "react-native-rsa";
//import RSAKey from "react-native-rsa/src/RSA";
import * as SecureStore from "expo-secure-store";

import * as Crypto from "expo-crypto";

export default function Login({
	setIsSignedIn,
	setUserId,
	setUserEmail,
	auth,
}) {
	//--States--//
	const [emailLogin, setEmailLogin] = useState("");
	const [passwordLogin, setPasswordLogin] = useState("");

	const [modalVisible, setModalVisible] = useState(false);
	const [showPasswordLogin, setShowPasswordLogin] = useState(false);
	const [showPasswordRegister, setShowPasswordRegister] = useState(false);

	//--Functions--//

	//Login:
	const handleLogin = () => {
		signInWithEmailAndPassword(auth, emailLogin, passwordLogin)
			.then((userCredential) => {
				// Signed in successfully
				const user = userCredential.user;
				const userEmail = user.email;

				setUserId(user.uid);
				setIsSignedIn(true); // Update state upon successful login
				setUserEmail(userEmail);
			})
			.catch((error) => {
				// Handle login error
				const errorCode = error.code;
				const errorMessage = error.message;

				console.error("Error signing in:", errorCode, errorMessage);
			});
	};

	//Register:

	const handleRegister = async () => {
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				emailLogin,
				passwordLogin
			); // Location of createUserWithEmailAndPassword
			const user = userCredential.user;
			const userEmail = user.email;

			// Generate and save RSA keys for the registered user
			await generateRSAKeys(user.uid); // Location of generateRSAKeys

			// Set the user ID state in App.js
			setUserId(user.uid);

			setUserEmail(userEmail);

			setIsSignedIn(true); // Update state upon successful registration
			setModalVisible(false); // Close modal after registration
		} catch (error) {
			const errorCode = error.code;
			const errorMessage = error.message;
			console.error("Error in registration:", errorCode, errorMessage);
		}
	};

	//Generate RSA keys:
	//import RSAKey from "react-native-rsa/src/RSA";
	const generateRSAKeys = async (userId) => {
		try {
			/*
			const RSAKey = require("react-native-rsa");
			const bits = 1024; // Specify the bit length of the key pair
			const exponent = "10001"; //must be a string. This is hex string. decimal = 65537

			const rsa = new RSAKey();
			rsa.generate(bits, exponent);

			const publicKey = rsa.getPublicString(); // Get the public key as a string/Return json encoded string
			const privateKey = rsa.getPrivateString(); // Get the private key as a string/Return json encoded string
			*/

			//const publicKey = crypto.randomBytes(32).toString("base64"); // Generate a random public key
			//const privateKey = crypto.randomBytes(32).toString("base64"); // Generate a random private key

			//Generate keys:
			const secretKey = Crypto.randomUUID();
			//const publicKey = Crypto.randomUUID();
			//const privateKey = Crypto.randomUUID();

			console.log("Secret key:", secretKey);
			//console.log("Public key:", publicKey);
			//console.log("Private key:", privateKey);

			// Store the keys securely associated with the user ID
			await SecureStore.setItemAsync(`secretKey_${userId}`, secretKey);
			//await SecureStore.setItemAsync(`publicKey_${userId}`, publicKey);
			//await SecureStore.setItemAsync(`privateKey_${userId}`, privateKey);

			console.log(
				"RSA keys generated and saved successfully for user:",
				userId
			);
		} catch (error) {
			console.error("Error generating and saving RSA keys:", error);
		}
	};

	//Handle modal:
	const hideModal = () => setModalVisible(false);
	const showModal = () => {
		console.log("Modal pressed");
		//setShowPassword(!showPassword);
		setModalVisible(true);
	};

	const containerStyle = {
		backgroundColor: "white",
		padding: 20,
		marginLeft: 10,
		marginRight: 10,
	};

	//<KeyboardAvoidingView behavior="height">

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			style={styles.container}
			keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
		>
			<View style={styles.container}>
				<Image
					style={{ marginTop: 90, marginBottom: 10, width: 250, height: 300 }}
					source={require("../logos/logo.png")}
				/>
				<Text variant="titleMedium" style={{ fontFamily: "monospace" }}>
					Random password generator
				</Text>

				<View style={{ marginTop: 20 }}></View>

				<View>
					<TextInput
						style={styles.textInputField}
						mode="outlined"
						label="Email"
						value={emailLogin}
						onChangeText={(text) => setEmailLogin(text)}
						theme={{ roundness: 100 }}
						contentStyle={{ width: 280 }}
						autoCapitalize="none"
					/>

					<View style={{ marginBottom: 10 }}></View>

					<TextInput
						style={styles.textInputField}
						mode="outlined"
						label="Password"
						value={passwordLogin}
						onChangeText={(text) => setPasswordLogin(text)}
						theme={{ roundness: 100 }}
						autoCapitalize="none"
						secureTextEntry={!showPasswordLogin}
						right={
							<TextInput.Icon
								//icon="eye"
								icon={showPasswordLogin ? "eye-off" : "eye"}
								onPress={() => setShowPasswordLogin(!showPasswordLogin)}
							/>
						}
					/>
				</View>

				<View style={{ marginTop: 40 }}></View>

				<Button
					mode="contained"
					onPress={handleLogin}
					buttonColor="#58184f"
					contentStyle={{ width: 130 }}
				>
					LOGIN
				</Button>

				<Button
					mode="text"
					onPress={showModal}
					//contentStyle={{ textColor: "#411858" }}
					textColor="#411858"
					rippleColor="#fff"
				>
					Register here
				</Button>

				<View style={{ marginTop: 120 }}></View>

				<Portal>
					<Modal
						visible={modalVisible}
						//transparent={true}
						onDismiss={hideModal}
						contentContainerStyle={containerStyle}

						//onRequestClose={() => setModalVisible(false)}
					>
						<View style={styles.modalContainer}>
							<Text style={{ fontSize: 18, marginBottom: 20 }}>Sign Up</Text>
							<TextInput
								style={[styles.textInputField, { marginBottom: 10 }]}
								mode="outlined"
								label="Email"
								value={emailLogin}
								onChangeText={(text) => setEmailLogin(text)}
								autoCapitalize="none"
							/>
							<TextInput
								style={[styles.textInputField, { marginBottom: 25 }]}
								mode="outlined"
								label="Password"
								value={passwordLogin}
								onChangeText={(text) => setPasswordLogin(text)}
								secureTextEntry={!showPasswordRegister}
								autoCapitalize="none"
								right={
									<TextInput.Icon
										//icon="eye"
										icon={showPasswordRegister ? "eye-off" : "eye"}
										onPress={() =>
											setShowPasswordRegister(!showPasswordRegister)
										}
									/>
								}
							/>
							<Button
								mode="contained"
								onPress={handleRegister}
								buttonColor="#58184f"
								//contentStyle={{ width: 130 }}
							>
								REGISTER
							</Button>
						</View>
					</Modal>
				</Portal>

				<StatusBar style="auto" />
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		//flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	textInputField: {
		//width: 280,
		//borderRadius: 40,
		//marginTop: 10,
		backgroundColor: "#f9f9fb",
		//marginBottom: 10,
	},
	modalContainer: {
		//width: "80%"
	},
});

//<Text style={{ color: "#411858" }}>Register here</Text>
